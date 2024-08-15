// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ERC1155               } from "./ERC1155.sol";
import { IRenderer             } from "./interfaces/IRenderer.sol";
import { ContractMetadata      } from "./libraries/ContractMetadata.sol";
import { SSTORE2               } from "./libraries/SSTORE2.sol";
import { Token                 } from "./types/Token.sol";

/// @notice To mint is a human right.
/// @author Visualize Value
contract Mint is ERC1155 {

    /// @notice Holds information about this collection.
    ContractMetadata.Data public metadata;

    /// @notice Holds the metadata for each token within this collection.
    mapping(uint => Token) public tokens;

    /// @notice The token metadata renderers registered with this collection.
    address[] public renderers;

    /// @notice The most recently minted token id.
    uint public latestTokenId;

    /// @notice Ethereum block height of when this collection was created.
    uint public initBlock;

    /// @notice Each mint is open for 24 hours (7200 ethereum blocks).
    uint constant MINT_BLOCKS = 7200;

    /// @dev Emitted when a collector mints a token.
    event NewMint(uint indexed tokenId, uint unitPrice, uint amount);

    /// @dev Emitted when the artist registers a new Renderer contract.
    event NewRenderer(address indexed renderer, uint indexed index);

    /// @dev Emitted when the artist withdraws the contract balance.
    event Withdrawal(uint amount);

    /// @dev Thrown on the attempt to reinitialize the contract.
    error Initialized();

    /// @dev Thrown when trying to mint a piece after the mint window.
    error MintClosed();

    /// @dev Thrown when trying to mint a piece below its current price.
    error MintPriceNotMet();

    /// @dev Thrown when trying to mint a non existent token.
    error NonExistentToken();

    /// @dev Thrown when trying to change an existing token.
    error TokenAlreadyMinted();

    /// @dev Thrown when trying to create a token with a non existent renderer assigned.
    error NonExistentRenderer();

    /// @notice Initializes the collection contract.
    function init(
        string memory contractName,
        string memory contractSymbol,
        string memory contractDescription,
        string memory contractImage,
        address renderer,
        address owner
    ) external {
        if (initBlock > 0) revert Initialized();

        // Initialize with metadata.
        metadata.name        = contractName;
        metadata.symbol      = contractSymbol;
        metadata.description = contractDescription;
        metadata.image       = contractImage;

        // Set the inial renderer
        renderers.push(renderer);

        // Seting the initialization block height prevents reinitialization
        // and is used for 24h mint window checks.
        initBlock = block.number;

        _transferOwnership(owner);
    }

    /// @notice Let's the artist create a new token.
    function create(
        string  calldata tokenName,
        string  calldata tokenDescription,
        bytes[] calldata tokenArtifact,
        uint32  tokenRenderer,
        uint192 tokenData
    ) public onlyOwner {
        if (renderers.length < tokenRenderer + 1) revert NonExistentRenderer();

        ++ latestTokenId;

        Token storage token = tokens[latestTokenId];

        token.name        = tokenName;
        token.description = tokenDescription;
        token.blocks      = uint32(block.number - initBlock);
        token.renderer    = tokenRenderer;
        token.data        = tokenData;

        if (tokenArtifact.length > 0) {
            // Clear previously prepared artifact data.
            if (token.artifact.length > 0) {
                delete token.artifact;
            }

            // Write the token artifact to storage.
            for (uint8 i = 0; i < tokenArtifact.length; i++) {
                token.artifact.push(SSTORE2.write(tokenArtifact[i]));
            }
        }

        _mint(msg.sender, latestTokenId, 1, "");
    }

    /// @notice Let's the artist prepare artifacts that are too large to store in a single transaction.
    function prepareArtifact(uint tokenId, bytes[] calldata tokenArtifact, bool clear) external onlyOwner {
        if (tokenId <= latestTokenId) revert TokenAlreadyMinted();

        Token storage token = tokens[tokenId];

        if (token.artifact.length > 0 && clear) { delete token.artifact; }

        // Write the token artifact to storage.
        for (uint8 i = 0; i < tokenArtifact.length; i++) {
            token.artifact.push(SSTORE2.write(tokenArtifact[i]));
        }
    }

    /// @notice Let's collectors purchase a token during its mint window.
    function mint(uint tokenId, uint amount) external payable {
        if (tokenId > latestTokenId) revert NonExistentToken();

        uint unitPrice = block.basefee * 60_000;
        uint mintPrice = unitPrice * amount;
        if (mintPrice > msg.value) revert MintPriceNotMet();

        if (mintOpenUntil(tokenId) < block.number) revert MintClosed();

        _mint(msg.sender, tokenId, amount, "");

        emit NewMint(tokenId, unitPrice, amount);
    }

    /// @notice Check until which block a mint is open.
    function mintOpenUntil(uint tokenId) public view returns (uint) {
        return initBlock + tokens[tokenId].blocks + MINT_BLOCKS;
    }

    /// @notice Let's the artist register a new renderer to use for future mints.
    function registerRenderer(address renderer) external onlyOwner returns (uint) {
        renderers.push(renderer);
        uint index = renderers.length - 1;

        emit NewRenderer(renderer, index);

        return index;
    }

    /// @notice Let's the artist withdraw the contract balance.
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);

        emit Withdrawal(address(this).balance);
    }

    /// @notice Get the metadata for a given token id.
    function uri(uint tokenId) external override view returns (string memory) {
        Token memory token = tokens[tokenId];

        return IRenderer(renderers[token.renderer]).uri(tokenId, token);
    }

    /// @notice Get the metadata for this collection contract.
    function contractURI() public view returns (string memory) {
        return ContractMetadata.uri(metadata);
    }

    /// @notice Burn a given token & amount.
    function burn(address account, uint256 tokenId, uint256 amount) external {
        if (account != msg.sender && !isApprovedForAll(account, msg.sender)) {
            revert ERC1155MissingApprovalForAll(msg.sender, account);
        }

        _burn(account, tokenId, amount);
    }

}
