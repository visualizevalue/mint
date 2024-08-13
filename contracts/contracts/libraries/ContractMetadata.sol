// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { Base64  } from "@openzeppelin/contracts/utils/Base64.sol";

library ContractMetadata {

    struct Data {
        string name;
        string symbol;
        string description;
        string image;
    }

    function uri (Data memory data) external pure returns (string memory) {
        bytes memory dataURI = abi.encodePacked(
            '{',
                '"name": "', data.name, '",',
                '"symbol": "', data.symbol, '",',
                '"description": "', data.description, '",',
                '"image": "', data.image, '"',
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
