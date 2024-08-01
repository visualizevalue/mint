// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { Base64 } from "@openzeppelin/contracts/utils/Base64.sol";
import { Token } from "./interfaces/IToken.sol";

contract Renderer {

    function uri (uint tokenId, Token calldata token) external pure returns (string memory) {
        bytes memory dataURI = abi.encodePacked(
            '{',
                '"id": "', Strings.toString(tokenId), '"',
                '"name": "', token.name, '"',
                '"description": "', token.description, '"',
                '"image": "', token.artifact, '"',
            '}'
        );

        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(dataURI)
            )
        );
    }

}
