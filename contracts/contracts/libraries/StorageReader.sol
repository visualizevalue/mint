// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Token   } from "./../types/Token.sol";
import { SSTORE2 } from "./SSTORE2.sol";

import "hardhat/console.sol";

library StorageReader {

    function getMetadata (Token memory token) external view returns (
        string memory name, string memory description
    ) {
        (string memory name, string memory description) = abi.decode(
            SSTORE2.read(token.metadata), (string, string)
        );

        return (name, description);
    }

    function getArtifact (Token memory token) external view returns (
        bytes memory content
    ) {
        for (uint8 i = 0; i < token.artifact.length; i++) {
            content = abi.encodePacked(content, SSTORE2.read(token.artifact[i]));
        }
    }

}

