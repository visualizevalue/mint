// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ERC1155               } from "./ERC1155.sol";
import { IERC20                } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IRenderer             } from "./interfaces/IRenderer.sol";
import { ContractMetadata      } from "./libraries/ContractMetadata.sol";
import { SSTORE2               } from "./libraries/SSTORE2.sol";
import { Token                 } from "./types/Token.sol";

/// @notice To mint is a human right, with ERC20 tokens.
/// @author Visualize Value
contract MintViaERC20 is ERC1155 {

    /// @notice Inaugural.
    uint public constant version = 1;

    /// @notice Holds information about this collection.
    ContractMetadata.Data private metadata;

    /// @notice Holds the metadata for each token within this collection.
    mapping(uint => Token) private tokens;

    /// @notice The token metadata renderers registered with this collection.
    address[] public renderers;

    /// @notice The most recently minted token id.
    uint public latestTokenId;

    /// @notice Ethereum block height of when this collection was created.
    uint public initBlock;

    /// @notice Each mint is open for 24 hours.
    uint constant MINT_DURATION = 24 hours;

    /// @notice Payment configuration for tokens
    struct PaymentConfig {
        address token;  // ERC20 token address
        uint256 price;  // Price in the token's smallest unit
    }

    /// @notice Payment configuration for each token
    mapping(uint => PaymentConfig) public payments;

    /// @dev Emitted when a collector mints a token.
    event NewMint(uint indexed tokenId, address paymentToken, uint price, uint amount, address minter);

    /// @dev Emitted when the artist registers a new Renderer contract.
    event NewRenderer(address indexed renderer, uint indexed index);

    /// @dev Emitted when the artist withdraws tokens from the contract.
    event Withdrawal(address indexed token, uint amount);

    /// @dev Thrown on the attempt to reinitialize the contract.
    error Initialized();

    /// @dev Thrown when trying to mint a piece after the mint window.
    error MintClosed();

    /// @dev Thrown when trying to mint a non existent token.
    error NonExistentToken();

    /// @dev Thrown when trying to change an existing token.
    error TokenAlreadyMinted();

    /// @dev Thrown when trying to create a token with a non existent renderer assigned.
    error NonExistentRenderer();

    /// @dev Thrown when the withdrawal fails.
    error WithdrawalFailed();

    /// @dev Thrown when the ERC20 transfer fails.
    error ERC20TransferFailed();

    /// @notice Initializes the collection contract.
    function init(
        string calldata contractName,
        string calldata contractSymbol,
        string calldata contractDescription,
        bytes[] calldata contractImage,
        address renderer,
        address owner
    ) external {
        if (initBlock > 0) revert Initialized();

        // Initialize with metadata.
        metadata.name        = contractName;
        metadata.symbol      = contractSymbol;
        metadata.description = contractDescription;

        // Write the contract image to storage.
        for (uint8 i = 0; i < contractImage.length; i++) {
            metadata.image.push(SSTORE2.write(contractImage[i]));
        }

        // Set the initial renderer
        renderers.push(renderer);

        // Setting the initialization block height prevents reinitialization
        initBlock = block.number;

        _transferOwnership(owner);
    }

    /// @notice Lets the artist create a new token with ERC20 payment.
    function create(
        string  calldata tokenName,
        string  calldata tokenDescription,
        bytes[] calldata tokenArtifact,
        uint32  tokenRenderer,
        uint128 tokenData,
        address paymentToken,
        uint256 price
    ) public onlyOwner {
        if (renderers.length < tokenRenderer + 1) revert NonExistentRenderer();

        ++ latestTokenId;

        Token storage token = tokens[latestTokenId];

        token.name        = tokenName;
        token.description = tokenDescription;
        token.mintedBlock = uint32(block.number);
        token.closeAt     = uint64(block.timestamp + MINT_DURATION);
        token.renderer    = tokenRenderer;
        token.data        = tokenData;

        // Set payment config for this token
        payments[latestTokenId] = PaymentConfig({
            token: paymentToken,
            price: price
        });

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

    /// @notice Lets the artist prepare artifacts that are too large to store in a single transaction.
    function prepareArtifact(uint tokenId, bytes[] calldata tokenArtifact, bool clear) external onlyOwner {
        if (tokenId <= latestTokenId) revert TokenAlreadyMinted();

        Token storage token = tokens[tokenId];

        if (token.artifact.length > 0 && clear) { delete token.artifact; }

        // Write the token artifact to storage.
        for (uint8 i = 0; i < tokenArtifact.length; i++) {
            token.artifact.push(SSTORE2.write(tokenArtifact[i]));
        }
    }

    /// @notice Get the bare token data for a given id.
    function get(uint tokenId) external view returns (
        string memory name,
        string memory description,
        address[] memory artifact,
        uint32 renderer,
        uint32 mintedBlock,
        uint64 closeAt,
        uint128 data
    ) {
        Token storage token = tokens[tokenId];

        return (
            token.name,
            token.description,
            token.artifact,
            token.renderer,
            token.mintedBlock,
            token.closeAt,
            token.data
        );
    }

    /// @notice Get the payment configuration for a token.
    function getPaymentConfig(uint tokenId) external view returns (address token, uint256 price) {
        if (tokenId > latestTokenId) revert NonExistentToken();
        
        PaymentConfig storage config = payments[tokenId];
        return (config.token, config.price);
    }

    /// @notice Lets collectors purchase a token during its mint window.
    function mint(uint tokenId, uint amount) external {
        if (tokenId > latestTokenId) revert NonExistentToken();
        if (mintOpenUntil(tokenId) < block.timestamp) revert MintClosed();

        PaymentConfig storage config = payments[tokenId];
        uint mintPrice = config.price * amount;
        
        // Transfer ERC20 tokens from the sender to this contract
        bool success = IERC20(config.token).transferFrom(msg.sender, address(this), mintPrice);
        if (!success) revert ERC20TransferFailed();
        
        _mint(msg.sender, tokenId, amount, "");
        
        emit NewMint(tokenId, config.token, config.price, amount, msg.sender);
    }

    /// @notice Check until when a mint is open.
    function mintOpenUntil(uint tokenId) public view returns (uint) {
        return tokens[tokenId].closeAt;
    }

    /// @notice Lets the artist register a new renderer to use for future mints.
    function registerRenderer(address renderer) external onlyOwner returns (uint) {
        renderers.push(renderer);
        uint index = renderers.length - 1;

        emit NewRenderer(renderer, index);

        return index;
    }

    /// @notice Lets the artist withdraw specific ERC20 tokens from the contract.
    function withdraw(address token) external onlyOwner {
        uint balance = IERC20(token).balanceOf(address(this));
        if (balance == 0) return;

        bool success = IERC20(token).transfer(owner(), balance);
        if (!success) revert WithdrawalFailed();

        emit Withdrawal(token, balance);
    }

    /// @notice Get the metadata for a given token id.
    function uri(uint tokenId) external override view returns (string memory) {
        if (tokenId > latestTokenId) revert NonExistentToken();

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