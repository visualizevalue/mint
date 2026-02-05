// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Strings        } from "@openzeppelin/contracts/utils/Strings.sol";
import { Base64         } from "@openzeppelin/contracts/utils/Base64.sol";
import { IRenderer      } from "./../interfaces/IRenderer.sol";
import { ArtifactReader } from "./../libraries/ArtifactReader.sol";
import { Token          } from "./../types/Token.sol";

contract MarkdownRenderer is IRenderer {

    uint constant MAX_PREVIEW_LENGTH = 800;

    /// @notice Expose the name of this renderer for easy registration in UIs.
    function name () external pure returns (string memory) {
        return "Markdown Renderer";
    }

    /// @notice Expose the version of this renderer to identify it in UIs.
    function version () external pure returns (uint) {
        return 1;
    }

    /// @notice Render the metadata URI of the token.
    function uri (uint tokenId, Token calldata token) external view returns (string memory) {
        bytes memory artifact = ArtifactReader.get(token);

        bytes memory dataURI = abi.encodePacked(
            '{',
                '"id": "', Strings.toString(tokenId), '",',
                '"name": "', token.name, '",',
                '"description": "', token.description, '",',
                '"type": "markdown",',
                '"image": "', _generateSVGDataURI(token.name, artifact), '",',
                '"animation_url": "', _markdownDataURI(artifact), '"',
            '}'
        );

        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(dataURI)
            )
        );
    }

    /// @notice Render the image URI of the token as an on-chain SVG.
    function imageURI (uint, Token calldata token) external view returns (string memory) {
        bytes memory artifact = ArtifactReader.get(token);

        return _generateSVGDataURI(token.name, artifact);
    }

    /// @notice Expose the markdown content as a data URI.
    function animationURI (uint, Token calldata token) external view returns (string memory) {
        bytes memory artifact = ArtifactReader.get(token);

        return _markdownDataURI(artifact);
    }

    /// @dev Generate a base64-encoded markdown data URI.
    function _markdownDataURI (bytes memory artifact) internal pure returns (string memory) {
        return string(
            abi.encodePacked(
                "data:text/markdown;base64,",
                Base64.encode(artifact)
            )
        );
    }

    /// @dev Generate an SVG preview of the markdown content.
    function _generateSVG (string memory title, bytes memory artifact) internal pure returns (bytes memory) {
        bytes memory preview = _sanitize(_truncate(artifact, MAX_PREVIEW_LENGTH));
        bytes memory safeTitle = _sanitize(bytes(title));

        return abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">'
                '<rect width="400" height="400" fill="#111"/>'
                '<text x="20" y="36" font-family="monospace" font-size="18" font-weight="bold" fill="white">',
                    safeTitle,
                '</text>'
                '<line x1="20" y1="50" x2="380" y2="50" stroke="#333" stroke-width="1"/>'
                '<foreignObject x="20" y="60" width="360" height="320">'
                    '<div xmlns="http://www.w3.org/1999/xhtml" style="'
                        'font-family:monospace;font-size:12px;color:#999;'
                        'white-space:pre-wrap;word-break:break-word;'
                        'overflow:hidden;height:320px;'
                        'mask-image:linear-gradient(to bottom,black 60%,transparent 100%);'
                        '-webkit-mask-image:linear-gradient(to bottom,black 60%,transparent 100%)'
                    '">',
                        preview,
                    '</div>'
                '</foreignObject>'
            '</svg>'
        );
    }

    /// @dev Wrap the generated SVG as a base64 data URI.
    function _generateSVGDataURI (string memory title, bytes memory artifact) internal pure returns (string memory) {
        return string(
            abi.encodePacked(
                "data:image/svg+xml;base64,",
                Base64.encode(_generateSVG(title, artifact))
            )
        );
    }

    /// @dev Truncate bytes to maxLen, appending "..." if truncated.
    function _truncate (bytes memory data, uint maxLen) internal pure returns (bytes memory) {
        if (data.length <= maxLen) {
            return data;
        }

        bytes memory result = new bytes(maxLen + 3);
        for (uint i = 0; i < maxLen; i++) {
            result[i] = data[i];
        }
        result[maxLen]     = '.';
        result[maxLen + 1] = '.';
        result[maxLen + 2] = '.';

        return result;
    }

    /// @dev Escape &, <, >, ", ' for safe SVG/XML embedding.
    function _sanitize (bytes memory input) internal pure returns (bytes memory) {
        // First pass: count extra bytes needed
        uint extraBytes;
        for (uint i = 0; i < input.length; i++) {
            bytes1 c = input[i];
            if (c == '&')      extraBytes += 4; // &amp;  = 5, original 1, extra 4
            else if (c == '<') extraBytes += 3; // &lt;   = 4, original 1, extra 3
            else if (c == '>') extraBytes += 3; // &gt;   = 4, original 1, extra 3
            else if (c == '"') extraBytes += 5; // &quot; = 6, original 1, extra 5
            else if (c == "'") extraBytes += 5; // &apos; = 6, original 1, extra 5
        }

        if (extraBytes == 0) return input;

        // Second pass: write escaped output
        bytes memory output = new bytes(input.length + extraBytes);
        uint j;
        for (uint i = 0; i < input.length; i++) {
            bytes1 c = input[i];
            if (c == '&') {
                output[j++] = '&'; output[j++] = 'a'; output[j++] = 'm'; output[j++] = 'p'; output[j++] = ';';
            } else if (c == '<') {
                output[j++] = '&'; output[j++] = 'l'; output[j++] = 't'; output[j++] = ';';
            } else if (c == '>') {
                output[j++] = '&'; output[j++] = 'g'; output[j++] = 't'; output[j++] = ';';
            } else if (c == '"') {
                output[j++] = '&'; output[j++] = 'q'; output[j++] = 'u'; output[j++] = 'o'; output[j++] = 't'; output[j++] = ';';
            } else if (c == "'") {
                output[j++] = '&'; output[j++] = 'a'; output[j++] = 'p'; output[j++] = 'o'; output[j++] = 's'; output[j++] = ';';
            } else {
                output[j++] = c;
            }
        }

        return output;
    }

}
