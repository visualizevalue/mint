// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {IERC1155MetadataURI} from "@openzeppelin/contracts/token/ERC1155/extensions/IERC1155MetadataURI.sol";
import {IERC165, ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {ERC1155} from "./libraries/ERC1155.sol";

/**
 * @dev Minimal library based implementation of the standard multi-token based on the OpenZeppelin contracts.
 * See https://eips.ethereum.org/EIPS/eip-1155
 */
abstract contract ERC1155LibraryImplementation is ERC165, IERC1155, IERC1155MetadataURI {
    using ERC1155 for ERC1155.ERC1155Database;

    ERC1155.ERC1155Database private database;

    /**
     * @notice Check the balance of a token.
     */
    function balanceOf(address account, uint256 id) external view returns (uint256) {
        return database.balanceOf(account, id);
    }

    /**
     * @notice Check the balance of multiple tokens.
     */
    function balanceOfBatch(address[] memory accounts, uint256[] memory ids) external view returns (uint256[] memory) {
        return database.balanceOfBatch(accounts, ids);
    }

    /**
     * @notice Set token approval for an operator.
     */
    function setApprovalForAll(address operator, bool approved) public {
        database.setApprovalForAll(operator, approved);
    }

    /**
     * @notice Check token approval for an account <> operator pair.
     */
    function isApprovedForAll(address account, address operator) public view returns (bool) {
        return database.isApprovedForAll(account, operator);
    }

    /**
     * @notice Transfer a token with a designated amount from an address to another address.
     */
    function safeTransferFrom(address from, address to, uint256 id, uint256 value, bytes memory data) public {
        database.safeTransferFrom(from, to, id, value, data);
    }

    /**
     * @notice Transfer multiple tokens with designated amounts from an address to another address.
     */
    function safeBatchTransferFrom(
        address from, address to, uint256[] memory ids, uint256[] memory values, bytes memory data
    ) public {
        database.safeBatchTransferFrom(from, to, ids, values, data);
    }

    /**
     * @notice Destroy the given amount of a token.
     */
    function burn(address from, uint256 id, uint256 value) public {
        database.burn(from, id, value);
    }

    /**
     * @notice Destroy the given amounts of all specified tokens.
     */
    function burnBatch(address from, uint256[] memory ids, uint256[] memory values) public {
        database.burnBatch(from, ids, values);
    }

    /**
     * @notice The URI for a given token.
     */
    function uri(uint256) external view virtual returns (string memory) {
        return "";
    }

    /**
     * @notice Mint a given token with the designated amount to an address.
     */
    function _mint(address to, uint256 id, uint256 value, bytes memory data) internal {
        database.mint(to, id, value, data);
    }

    /**
     * @notice Mint the given tokens with the designated amounts to an address.
     */
    function _mintBatch(address to, uint256[] memory ids, uint256[] memory values, bytes memory data) internal {
        database.mintBatch(to, ids, values, data);
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        return
            interfaceId == type(IERC1155).interfaceId ||
            interfaceId == type(IERC1155MetadataURI).interfaceId ||
            super.supportsInterface(interfaceId);
    }

}
