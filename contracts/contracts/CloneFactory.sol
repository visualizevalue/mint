// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "./MintClonable.sol";

contract MintFactory {
    event Created(address contractAddress, address ownerAddress);

    address immutable implementation;

    constructor(address _implementation) {
        implementation = _implementation;
    }

    function createMint(
        string memory name,
        string memory symbol,
        string memory description,
        string memory image
    ) external returns (address) {
        address mint = Clones.clone(implementation);

        MintClonable(mint).init(
            name,
            symbol,
            description,
            image,
            msg.sender
        );

        emit Created(mint, msg.sender);

        return mint;
    }
}
