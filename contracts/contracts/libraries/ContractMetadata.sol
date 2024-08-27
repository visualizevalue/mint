// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { Base64  } from "@openzeppelin/contracts/utils/Base64.sol";
import { SSTORE2 } from "./SSTORE2.sol";

library ContractMetadata {

    struct Data {
        string name;
        string symbol;
        string description;
        address[] image;
    }

    function uri (Data memory data) external view returns (string memory) {
        bytes memory dataURI = abi.encodePacked(
            '{',
                '"name": "', data.name, '",',
                '"symbol": "', data.symbol, '",',
                '"description": "', data.description, '",',
                '"image": "', image(data), '"',
            '}'
        );

        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(dataURI)
            )
        );
    }

    function image (Data memory data) internal view returns (bytes memory content) {
        for (uint8 i = 0; i < data.image.length; i++) {
            content = abi.encodePacked(content, SSTORE2.read(data.image[i]));
        }
    }

}
