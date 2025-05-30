// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Strings        } from "@openzeppelin/contracts/utils/Strings.sol";
import { Base64         } from "@openzeppelin/contracts/utils/Base64.sol";
import { IRenderer      } from "./../interfaces/IRenderer.sol";
import { ArtifactReader } from "./../libraries/ArtifactReader.sol";
import { Token          } from "./../types/Token.sol";

contract AnimationRenderer is IRenderer {

    /// @notice Expose the name of this renderer for easy registration in UIs.
    function name () external pure returns (string memory) {
        return "Animation Renderer";
    }

    /// @notice Expose the version of this renderer to identify it in UIs.
    function version () external pure returns (uint) {
        return 1;
    }

    /// @notice Render the metadata URI of the token.
    function uri (uint tokenId, Token calldata token) external view returns (string memory) {
        (string memory image, string memory animation) = abi.decode(ArtifactReader.get(token), (string, string));

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

    /// @notice Render the image URI of the token.
    function imageURI (uint, Token calldata token) external view returns (string memory) {
        (string memory image,) = abi.decode(ArtifactReader.get(token), (string, string));

        return image;
    }

    /// @notice Expose the animation URI of the token.
    function animationURI (uint, Token calldata token) external view returns (string memory) {
        (,string memory animation) = abi.decode(ArtifactReader.get(token), (string, string));

        return animation;
    }

}
