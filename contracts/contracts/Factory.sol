// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "./Mint.sol";

contract Factory {
    event Created(address contractAddress, address ownerAddress);

    function create(
        string memory name,
        string memory description,
        string memory image
    ) public {
        Mint mint = new Mint(name, description, image, msg.sender);

        emit Created(address(mint), msg.sender);
    }
}
