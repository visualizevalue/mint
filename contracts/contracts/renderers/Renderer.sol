// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Strings        } from "@openzeppelin/contracts/utils/Strings.sol";
import { Base64         } from "@openzeppelin/contracts/utils/Base64.sol";
import { IRenderer      } from "./../interfaces/IRenderer.sol";
import { StorageReader  } from "./../libraries/StorageReader.sol";
import { Token          } from "./../types/Token.sol";

contract Renderer is IRenderer {

    /// @notice Expose the name of this renderer for easy registration in UIs.
    function name () external pure returns (string memory) {
        return "Base Renderer";
    }

    /// @notice Expose the version of this renderer to identify it in UIs.
    function version () external pure returns (uint) {
        return 1;
    }

    /// @notice Render the metadata URI of the token.
    function uri (uint tokenId, Token calldata token) external view returns (string memory) {
        (string memory name, string memory description) = StorageReader.getMetadata(token);
        bytes memory artifact = StorageReader.getArtifact(token);

        bytes memory dataURI = abi.encodePacked(
            '{',
                '"id": "', Strings.toString(tokenId), '",',
                '"name": "', name, '",',
                '"description": "', description, '",',
                '"image": "', artifact, '"',
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
        return string(StorageReader.getArtifact(token));
    }

    /// @notice The base renderer doesn't have an animation.
    function animationURI (uint, Token calldata) external pure returns (string memory) {
        return "";
    }

}
