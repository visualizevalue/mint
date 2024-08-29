// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import { ERC1967Proxy } from "./Upgrades.sol";

/// @notice To mint is a human right.
/// @author Visualize Value
contract Factory is ERC1967Proxy {

    constructor(address factory, address mint, address renderer) ERC1967Proxy(
        factory,
        abi.encodeWithSignature("initialize(address,address)", mint, renderer)
    ) {}

}
