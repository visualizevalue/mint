// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Strings   } from "@openzeppelin/contracts/utils/Strings.sol";
import { Base64    } from "@openzeppelin/contracts/utils/Base64.sol";
import { IRenderer } from "../interfaces/IRenderer.sol";
import { Token     } from "../types/Token.sol";

contract MockRenderer is IRenderer {

    function name () external pure returns (string memory) {
        return "Mock Renderer";
    }

    function version () external pure returns (uint) {
        return 1;
    }


    function uri (uint, Token calldata token) external pure returns (string memory) {
        bytes memory dataURI = abi.encodePacked(
            '{',
                '"foo": "bar",',
                '"data": "', Strings.toString(token.data), '"',
            '}'
        );

        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(dataURI)
            )
        );
    }

    function imageURI (uint, Token calldata) external pure returns (string memory) {
        return "void";
    }

    function animationURI (uint, Token calldata) external pure returns (string memory) {
        return "void";
    }

}
