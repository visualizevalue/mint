// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "./ERC1155.sol";
import "./interfaces/IRenderer.sol";
import "./libraries/ContractMetadata.sol";
import "./types/Token.sol";

/// @notice To mint is a human right.
contract MintClonable is ERC1155, Ownable2Step {
    string public name;
    string public symbol;
    string public description;
    string public image;

    mapping(uint => Token) public tokens;

    address[] public renderers;
    uint public latestTokenId;
    uint public initBlock;

    uint constant MINT_BLOCKS = 7200;

    event NewMint(uint indexed tokenId);
    event NewMintPurchase(uint indexed tokenId, uint unitPrice, uint amount);
    event NewRenderer(address indexed renderer, uint indexed index);
    event Withdrawal(uint amount);

    error Initialized();
    error MintClosed();
    error MintPriceNotMet();
    error NonExistentToken();
    error NonExistentRenderer();

    constructor() Ownable(msg.sender) {}

    function init(
        string memory contractName,
        string memory contractSymbol,
        string memory contractDescription,
        string memory contractImage,
        address owner
    ) external {
        if (initBlock > 0) revert Initialized();

        name        = contractName;
        symbol      = contractSymbol;
        description = contractDescription;
        image       = contractImage;

        initBlock = block.number;

        _transferOwnership(owner);
    }

    function create(
        string  calldata tokenName,
        string  calldata tokenDescription,
        string  calldata tokenArtifact,
        uint32  tokenRenderer,
        uint192 tokenData
    ) public onlyOwner {
        if (renderers.length < tokenRenderer + 1) revert NonExistentRenderer();

        ++ latestTokenId;

        Token storage token = tokens[latestTokenId];

        token.name        = tokenName;
        token.description = tokenDescription;
        token.artifact    = tokenArtifact;
        token.blocks      = uint32(block.number - initBlock);
        token.renderer    = tokenRenderer;
        token.data        = tokenData;

        _mint(msg.sender, latestTokenId, 1, "");

        emit NewMint(latestTokenId);
    }

    function mint(uint tokenId, uint amount) external payable {
        if (tokenId > latestTokenId) revert NonExistentToken();

        uint unitPrice = block.basefee * 61_000;
        uint mintPrice = unitPrice * amount;
        if (mintPrice > msg.value) revert MintPriceNotMet();

        uint untilBlock = MINT_BLOCKS + tokens[latestTokenId].blocks + initBlock;
        if (untilBlock < block.number) revert MintClosed();

        _mint(msg.sender, tokenId, amount, "");

        emit NewMintPurchase(tokenId, unitPrice, amount);
    }

    function registerRenderer(address renderer) external onlyOwner returns (uint) {
        renderers.push(renderer);
        uint index = renderers.length - 1;

        emit NewRenderer(renderer, index);

        return index;
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);

        emit Withdrawal(address(this).balance);
    }

    function uri(uint tokenId) external override view returns (string memory) {
        Token memory token = tokens[tokenId];

        return IRenderer(renderers[token.renderer]).uri(tokenId, token);
    }

    function contractURI() public view returns (string memory) {
        ContractMetadata.Data memory contractData = ContractMetadata.Data(name, symbol, description, image);

        return ContractMetadata.uri(contractData);
    }

    function burn(address account, uint256 tokenId, uint256 amount) external {
        if (account != msg.sender && !isApprovedForAll(account, msg.sender)) {
            revert ERC1155MissingApprovalForAll(msg.sender, account);
        }

        _burn(account, tokenId, amount);
    }
}
