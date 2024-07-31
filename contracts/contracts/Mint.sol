// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "./interfaces/IToken.sol";

contract Mint is ERC1155, Ownable2Step {
    event Withdrawal(uint amount);

    mapping(uint => Token) public tokens;

    uint public latestTokenId;
    uint public totalSupply;

    constructor(
        string memory name,
        string memory description,
        string memory image,
        address initialOwner
    )
        ERC1155("")
        Ownable(initialOwner)
    {}

    function create(
        string calldata name,
        string calldata description,
        string calldata image,
        uint8  calldata imageType,
        bool   calldata interactive
    ) public onlyOwner {
        latestTokenId ++;

        Token storage token = tokens[latestTokenId];

        token.name        = name;
        token.description = description;
        token.image       = image;
        token.blockNumber = block.number;
        token.imageType   = imageType;
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

    function uri(uint tokenId) public view returns (string memory) {
        Token token = tokens[tokenId];
        return "";
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
