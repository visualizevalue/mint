// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Strings   } from "@openzeppelin/contracts/utils/Strings.sol";
import { Base64    } from "@openzeppelin/contracts/utils/Base64.sol";
import { IRenderer } from "./../interfaces/IRenderer.sol";
import { SSTORE2   } from "./../libraries/SSTORE2.sol";
import { Token     } from "./../types/Token.sol";

contract P5Renderer is IRenderer {

    /// @notice Generate the JSON medata for a given token.
    ///         We expect the static preview image and P5 script
    //          to both be encoded in the artifact data.
    function uri (
        uint tokenId,
        Token calldata token,
        bytes memory artifact
    ) external pure returns (string memory) {
        (string memory image, string memory script) = abi.decode(artifact, (string, string));

        bytes memory animation = generateHtmlURI(generateHtml(token.name, script));

        bytes memory dataURI = abi.encodePacked(
            '{',
                '"id": "', Strings.toString(tokenId), '",',
                '"name": "', token.name, '",',
                '"description": "', token.description, '",',
                '"image": "', image, '",',
                '"animation_url": "', animation, '"',
            '}'
        );

        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(dataURI)
            )
        );
    }

    /// @dev Transforms a given HTML string into its data-uri encoded version.
    function generateHtmlURI (bytes memory html) internal pure returns (bytes memory) {
        return abi.encodePacked(
            "data:text/html;base64,",
            Base64.encode(html)
        );
    }

    /// @dev Generates the HTML for a given token script.
    function generateHtml (string memory name, string memory script) internal pure returns (bytes memory) {
        return abi.encodePacked(
            '<!DOCTYPE html>',
            '<html lang="en">',
            '<head>',
                '<meta charset="UTF-8">',
                '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
                '<title>', name, '</title>',
                '<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js"></script>',
                '<style> body { margin: 0; padding: 0; } </style>',
            '</head>',
            '<body>',
                '<script>',
                    script,
                '</script>',
            '</body>',
            '</html>'
        );
    }

}
