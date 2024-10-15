// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Token } from "../types/Token.sol";

interface IRenderer {
    function name () external pure returns (string memory);

    function version () external pure returns (uint version);

    function uri (uint tokenId, Token calldata token) external view returns (string memory);

    function imageURI (uint tokenId, Token calldata token) external view returns (string memory);

    function animationURI (uint tokenId, Token calldata token) external view returns (string memory);
}
