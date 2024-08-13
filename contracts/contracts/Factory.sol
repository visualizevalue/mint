// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import { Clone } from "./libraries/Clone.sol";
import { Mint  } from "./Mint.sol";

/// @notice To mint is a human right.
/// @author Visualize Value
contract Factory {

    /// @dev Emitted when a new Mint contract is deployed.
    event Created(address contractAddress, address ownerAddress);

    /// @dev The Mint contract implementation to base clonse off.
    address immutable private baseImplementation;

    /// @dev Initialize the contract with a base clonable implementation.
    constructor() {
        Mint mint = new Mint();
        mint.init("", "", "", "", address(this));
        baseImplementation = address(mint);
    }

    /// @notice Deploy a new Mint contract with the specified metadata.
    /// This is more expensive to deploy but recommended when expecting more than a few hundred collectors.
    function create(
        string memory name,
        string memory symbol,
        string memory description,
        string memory image
    ) external returns (address) {
        Mint mint = new Mint();

        mint.init(name, symbol, description, image, msg.sender);

        emit Created(address(mint), msg.sender);

        return address(mint);
    }

    /// @notice Deploy a copy of the base Mint contract.
    /// This is cheaper to deploy but adds a small overhead to each token interaction (mint/transfer/...).
    function clone(
        string memory name,
        string memory symbol,
        string memory description,
        string memory image
    ) external returns (address) {
        address mint = Clone.clone(baseImplementation);

        Mint(mint).init( name, symbol, description, image, msg.sender);

        emit Created(mint, msg.sender);

        return mint;
    }

}
