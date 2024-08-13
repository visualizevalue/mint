// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "./MintViaLibrary.sol";

contract FactoryMintLibrary {
    event Created(address contractAddress, address ownerAddress);

    function create(
        string memory name,
        string memory symbol,
        string memory description,
        string memory artifact
    ) public {
        MintViaLibrary mint = new MintViaLibrary(name, symbol, description, artifact, msg.sender);

        emit Created(address(mint), msg.sender);
    }
}
