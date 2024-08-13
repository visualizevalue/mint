// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "./Mint.sol";

// contract MyFactory {
//     address immutable implementation;

//     constructor(address _implementation) {
//         implementation = _implementation;
//     }

//     function createClone() external returns (address) {
//         return Clones.clone(implementation);
//     }
// }


contract Factory {
    event Created(address contractAddress, address ownerAddress);

    address[] implementations;

    function create(
        string memory name,
        string memory symbol,
        string memory description,
        string memory artifact
    ) public {
        Mint mint = new Mint(name, symbol, description, artifact, msg.sender);

        emit Created(address(mint), msg.sender);
    }
}
