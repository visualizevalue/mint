// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../types/Token.sol";

interface IRenderer {
    function uri (uint tokenId, Token calldata token) external pure returns (string memory);
}
