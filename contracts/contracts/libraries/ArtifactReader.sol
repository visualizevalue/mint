// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Token   } from "./../types/Token.sol";
import { SSTORE2 } from "./SSTORE2.sol";

library ArtifactReader {

    function get (Token memory token) public view returns (bytes memory content) {
        for (uint8 i = 0; i < token.artifact.length; i++) {
            content = abi.encodePacked(content, SSTORE2.read(token.artifact[i]));
        }
    }

}

