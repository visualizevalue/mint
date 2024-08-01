// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "./interfaces/IRenderer.sol";
import "./interfaces/IToken.sol";

contract Mint is ERC1155, Ownable2Step {
    event Withdrawal(uint amount);

    mapping(uint => Token) public tokens;

    address[] public renderers;
    uint public latestTokenId;
    uint public totalSupply;

    constructor(
        string memory name,
        string memory description,
        string memory artifact,
        address initialOwner
    )
        ERC1155("")
        Ownable(initialOwner)
    {}

    function create(
        string calldata name,
        string calldata description,
        string calldata artifact,
        uint16 renderer,
        bool   interactive
    ) public onlyOwner {
        latestTokenId ++;

        Token storage token = tokens[latestTokenId];

        token.name        = name;
        token.description = description;
        token.artifact    = artifact;
        token.blockNumber = uint64(block.number);
        token.renderer    = renderer;
        token.interactive = interactive;

        _mint(msg.sender, latestTokenId, 1, "");
    }

    function mint(uint tokenId) public {
        totalSupply ++;

        _mint(msg.sender, tokenId, 1, "");
    }

    function mintMany(uint tokenId, uint amount) public {
        totalSupply += amount;

        _mint(msg.sender, tokenId, amount, "");
    }

    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);

        emit Withdrawal(address(this).balance);
    }

    function uri(uint tokenId) public override view returns (string memory) {
        Token memory token = tokens[tokenId];

        return IRenderer(renderers[token.renderer]).uri(tokenId, token);
    }

    // Move
    function burn(address account, uint256 id, uint256 amount) public {
        if (account != _msgSender() && !isApprovedForAll(account, _msgSender())) {
            revert ERC1155MissingApprovalForAll(_msgSender(), account);
        }

        totalSupply -= amount;

        _burn(account, id, amount);
    }
}
