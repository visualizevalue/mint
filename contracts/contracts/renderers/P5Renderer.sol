// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Strings   } from "@openzeppelin/contracts/utils/Strings.sol";
import { Base64    } from "@openzeppelin/contracts/utils/Base64.sol";
import { IScriptyBuilderV2,
         HTMLRequest,
         HTMLTagType,
         HTMLTag } from "scripty.sol/contracts/scripty/interfaces/IScriptyBuilderV2.sol";
import { IRenderer } from "./../interfaces/IRenderer.sol";
import { Token     } from "./../types/Token.sol";

contract P5Renderer is IRenderer {
    address constant private ethfsFileStorage = 0x8FAA1AAb9DA8c75917C43Fb24fDdb513edDC3245;
    address constant private scriptyBuilder   = 0xD7587F110E08F4D120A231bA97d3B577A81Df022;
    address constant private scriptyStorage   = 0xbD11994aABB55Da86DC246EBB17C1Be0af5b7699;

    /// @notice Expose the name of this renderer for easy registration in UIs.
    function name () external pure returns (string memory) {
        return "P5 Renderer";
    }

    /// @notice Expose the version of this renderer to identify it in UIs.
    function version () external pure returns (uint) {
        return 1;
    }

    /// @notice Generate the JSON medata for a given token.
    ///         We expect the static preview image and P5 script
    //          to both be encoded in the artifact data.
    function uri (
        uint tokenId,
        Token calldata token,
        bytes memory artifact
    ) external view returns (string memory) {
        (string memory image, string memory script) = abi.decode(artifact, (string, string));

        bytes memory dataURI = abi.encodePacked(
            '{',
                '"id": "', Strings.toString(tokenId), '",',
                '"name": "', token.name, '",',
                '"description": "', token.description, '",',
                '"image": "', image, '",',
                '"script_url": "data:text/javascript;base64,', Base64.encode(bytes(script)), '",',
                '"animation_url": "', generateHtml(token.name, script), '"',
            '}'
        );

        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(dataURI)
            )
        );
    }

    /// @dev Generates the HTML for a given token script.
    function generateHtml (string memory name, string memory script) internal view returns (bytes memory) {
        HTMLTag[] memory headTags = new HTMLTag[](2);

        // Name the file
        headTags[0].tagOpen = "<title>";
        headTags[0].tagContent = bytes(name);
        headTags[0].tagClose = "</title>";

        // Add base styles
        headTags[1].name = "fullSizeCanvas.css";
        headTags[1].tagOpen = '<link rel="stylesheet" href="data:text/css;base64,';
        headTags[1].tagClose = '">';
        headTags[1].contractAddress = ethfsFileStorage;

        // Add p5 script
        HTMLTag[] memory bodyTags = new HTMLTag[](3);
        bodyTags[0].name = "p5-v1.5.0.min.js.gz";
        bodyTags[0].tagType = HTMLTagType.scriptGZIPBase64DataURI;
        bodyTags[0].contractAddress = ethfsFileStorage;

        // Unzip p5 script
        bodyTags[1].name = "gunzipScripts-0.0.1.js";
        bodyTags[1].tagType = HTMLTagType.scriptBase64DataURI;
        bodyTags[1].contractAddress = ethfsFileStorage;

        // Add our p5 script
        bodyTags[2].tagContent = bytes(script);
        bodyTags[2].tagType = HTMLTagType.script;

        // Assemble the html
        HTMLRequest memory htmlRequest;
        htmlRequest.headTags = headTags;
        htmlRequest.bodyTags = bodyTags;

        return IScriptyBuilderV2(scriptyBuilder).getEncodedHTML(htmlRequest);
    }

}
