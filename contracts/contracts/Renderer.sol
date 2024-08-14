// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Strings   } from "@openzeppelin/contracts/utils/Strings.sol";
import { Base64    } from "@openzeppelin/contracts/utils/Base64.sol";
import { IRenderer } from "./interfaces/IRenderer.sol";
import { SSTORE2   } from "./libraries/SSTORE2.sol";
import { Token     } from "./types/Token.sol";

contract Renderer is IRenderer {

    function uri (uint tokenId, Token calldata token) external view returns (string memory) {
        bytes memory dataURI = abi.encodePacked(
            '{',
                '"id": "', Strings.toString(tokenId), '",',
                '"name": "', token.name, '",',
                '"description": "', token.description, '",',
                '"image": "', readArtifact(token), '"',
            '}'
        );

        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(dataURI)
            )
        );
    }

    function readArtifact (Token calldata token) internal view returns (bytes memory artifact) {
        for (uint8 i = 0; i < token.artifact.length; i++) {
            artifact = abi.encodePacked(artifact, SSTORE2.read(token.artifact[i]));
        }
    }

}
