// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/utils/Arrays.sol";
import "./ERC1155Errors.sol";
import "./ERC1155Events.sol";

library ERC1155 {
    using Arrays for uint256[];
    using Arrays for address[];

    /**
     * @dev This holds the storage bag required for this library to work (token balances and approvals).
     */
    struct ERC1155Database {
        // Mapping from token ID to account balances
        mapping(uint256 id => mapping(address account => uint256)) balances;

        // Mapping from account to operator approvals
        mapping(address account => mapping(address operator => bool)) operatorApprovals;
    }

    /**
     * @dev Creates a `value` amount of tokens of type `id`, and assigns them to `to`.
     *
     * Emits a {TransferSingle} event.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - If `to` refers to a smart contract, it must implement {IERC1155Receiver-onERC1155Received} and return the
     * acceptance magic value.
     */
    function mint(
        ERC1155Database storage database,
        address to,
        uint256 id,
        uint256 value,
        bytes memory data
    ) public {
        if (to == address(0)) {
            revert ERC1155Errors.ERC1155InvalidReceiver(address(0));
        }
        (uint256[] memory ids, uint256[] memory values) = _asSingletonArrays(id, value);
        _updateWithAcceptanceCheck(database, address(0), to, ids, values, data);
    }

    /**
     * @dev xref:ROOT:erc1155.adoc#batch-operations[Batched] version of {_mint}.
     *
     * Emits a {TransferBatch} event.
     *
     * Requirements:
     *
     * - `ids` and `values` must have the same length.
     * - `to` cannot be the zero address.
     * - If `to` refers to a smart contract, it must implement {IERC1155Receiver-onERC1155BatchReceived} and return the
     * acceptance magic value.
     */
    function mintBatch(
        ERC1155Database storage database,
        address to,
        uint256[] memory ids,
        uint256[] memory values,
        bytes memory data
    ) public {
        if (to == address(0)) {
            revert ERC1155Errors.ERC1155InvalidReceiver(address(0));
        }
        _updateWithAcceptanceCheck(database, address(0), to, ids, values, data);
    }

    /**
     * @dev Returns the value of tokens of token type `id` owned by `account`.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     */
    function balanceOf(ERC1155Database storage database, address account, uint256 id) public view returns (uint256) {
        require(account != address(0), "ERC1155: balance query for the zero address");

        return database.balances[id][account];
    }

    /**
     * @dev See {IERC1155-balanceOfBatch}.
     *
     * Requirements:
     *
     * - `accounts` and `ids` must have the same length.
     */
    function balanceOfBatch(
        ERC1155Database storage database,
        address[] memory accounts,
        uint256[] memory ids
    ) public view returns (uint256[] memory) {
        if (accounts.length != ids.length) {
            revert ERC1155Errors.ERC1155InvalidArrayLength(ids.length, accounts.length);
        }

        uint256[] memory batchBalances = new uint256[](accounts.length);

        for (uint256 i = 0; i < accounts.length; ++i) {
            batchBalances[i] = balanceOf(database, accounts.unsafeMemoryAccess(i), ids.unsafeMemoryAccess(i));
        }

        return batchBalances;
    }

    /**
     * @dev Approve `operator` to operate on all owned tokens
     *
     * Emits an {ApprovalForAll} event.
     *
     * Requirements:
     *
     * - `operator` cannot be the zero address.
     */
    function setApprovalForAll(ERC1155Database storage database, address operator, bool approved) public {
        if (operator == address(0)) {
            revert ERC1155Errors.ERC1155InvalidOperator(address(0));
        }
        database.operatorApprovals[msg.sender][operator] = approved;
        emit ERC1155Events.ApprovalForAll(msg.sender, operator, approved);
    }

    /**
     * @dev Returns true if `operator` is approved to transfer ``account``'s tokens.
     */
    function isApprovedForAll(
        ERC1155Database storage database,
        address account,
        address operator
    ) public view returns (bool) {
        return database.operatorApprovals[account][operator];
    }

    /**
     * @dev See {IERC1155-safeTransferFrom}.
     *
     * Transfers a `value` tokens of token type `id` from `from` to `to`.
     *
     * Emits a {TransferSingle} event.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - `from` must have a balance of tokens of type `id` of at least `value` amount.
     * - If `to` refers to a smart contract, it must implement {IERC1155Receiver-onERC1155Received} and return the
     * acceptance magic value.
     */
    function safeTransferFrom(
        ERC1155Database storage database,
        address from,
        address to,
        uint256 id,
        uint256 value,
        bytes memory data
    ) public {
        if (from != msg.sender && !isApprovedForAll(database, from, msg.sender)) {
            revert ERC1155Errors.ERC1155MissingApprovalForAll(msg.sender, from);
        }
        if (to == address(0)) {
            revert ERC1155Errors.ERC1155InvalidReceiver(address(0));
        }
        if (from == address(0)) {
            revert ERC1155Errors.ERC1155InvalidSender(address(0));
        }
        (uint256[] memory ids, uint256[] memory values) = _asSingletonArrays(id, value);
        _updateWithAcceptanceCheck(database, from, to, ids, values, data);
    }

    /**
     * @dev See {IERC1155-safeBatchTransferFrom}.
     *
     * xref:ROOT:erc1155.adoc#batch-operations[Batched] version of {_safeTransferFrom}.
     *
     * Emits a {TransferBatch} event.
     *
     * Requirements:
     *
     * - If `to` refers to a smart contract, it must implement {IERC1155Receiver-onERC1155BatchReceived} and return the
     * acceptance magic value.
     * - `ids` and `values` must have the same length.
     */
    function safeBatchTransferFrom(
        ERC1155Database storage database,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values,
        bytes memory data
    ) public {
        if (from != msg.sender && !isApprovedForAll(database, from, msg.sender)) {
            revert ERC1155Errors.ERC1155MissingApprovalForAll(msg.sender, from);
        }
        if (to == address(0)) {
            revert ERC1155Errors.ERC1155InvalidReceiver(address(0));
        }
        if (from == address(0)) {
            revert ERC1155Errors.ERC1155InvalidSender(address(0));
        }
        _updateWithAcceptanceCheck(database, from, to, ids, values, data);
    }

    /**
     * @dev Destroys a `value` amount of tokens of type `id` from `from`
     *
     * Emits a {TransferSingle} event.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `from` must have at least `value` amount of tokens of type `id`.
     */
    function burn(
        ERC1155Database storage database,
        address from,
        uint256 id,
        uint256 value
    ) public {
        if (from == address(0)) {
            revert ERC1155Errors.ERC1155InvalidSender(address(0));
        }
        (uint256[] memory ids, uint256[] memory values) = _asSingletonArrays(id, value);
        _updateWithAcceptanceCheck(database, from, address(0), ids, values, "");
    }

    /**
     * @dev xref:ROOT:erc1155.adoc#batch-operations[Batched] version of {_burn}.
     *
     * Emits a {TransferBatch} event.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `from` must have at least `value` amount of tokens of type `id`.
     * - `ids` and `values` must have the same length.
     */
    function burnBatch(
        ERC1155Database storage database,
        address from,
        uint256[] memory ids,
        uint256[] memory values
    ) public {
        if (from == address(0)) {
            revert ERC1155Errors.ERC1155InvalidSender(address(0));
        }
        _updateWithAcceptanceCheck(database, from, address(0), ids, values, "");
    }

    /**
     * @dev Transfers a `value` amount of tokens of type `id` from `from` to `to`. Will mint (or burn) if `from`
     * (or `to`) is the zero address.
     *
     * Emits a {TransferSingle} event if the arrays contain one element, and {TransferBatch} otherwise.
     *
     * Requirements:
     *
     * - If `to` refers to a smart contract, it must implement either {IERC1155Receiver-onERC1155Received}
     *   or {IERC1155Receiver-onERC1155BatchReceived} and return the acceptance magic value.
     * - `ids` and `values` must have the same length.
     *
     * NOTE: The ERC-1155 acceptance check is not performed in this function. See {_updateWithAcceptanceCheck} instead.
     */
    function _update(
        ERC1155Database storage database,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) private {
        if (ids.length != values.length) {
            revert ERC1155Errors.ERC1155InvalidArrayLength(ids.length, values.length);
        }

        address operator = msg.sender;

        for (uint256 i = 0; i < ids.length; ++i) {
            uint256 id = ids.unsafeMemoryAccess(i);
            uint256 value = values.unsafeMemoryAccess(i);

            if (from != address(0)) {
                uint256 fromBalance = database.balances[id][from];
                if (fromBalance < value) {
                    revert ERC1155Errors.ERC1155InsufficientBalance(from, fromBalance, value, id);
                }
                unchecked {
                    // Overflow not possible: value <= fromBalance
                    database.balances[id][from] = fromBalance - value;
                }
            }

            if (to != address(0)) {
                database.balances[id][to] += value;
            }
        }

        if (ids.length == 1) {
            uint256 id = ids.unsafeMemoryAccess(0);
            uint256 value = values.unsafeMemoryAccess(0);
            emit ERC1155Events.TransferSingle(operator, from, to, id, value);
        } else {
            emit ERC1155Events.TransferBatch(operator, from, to, ids, values);
        }
    }

    /**
     * @dev Version of {_update} that performs the token acceptance check by calling
     * {IERC1155Receiver-onERC1155Received} or {IERC1155Receiver-onERC1155BatchReceived} on the receiver address if it
     * contains code (eg. is a smart contract at the moment of execution).
     *
     * IMPORTANT: Overriding this function is discouraged because it poses a reentrancy risk from the receiver. So any
     * update to the contract state after this function would break the check-effect-interaction pattern. Consider
     * overriding {_update} instead.
     */
    function _updateWithAcceptanceCheck(
        ERC1155Database storage database,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values,
        bytes memory data
    ) private {
        _update(database, from, to, ids, values);
        if (to != address(0)) {
            address operator = msg.sender;
            if (ids.length == 1) {
                uint256 id = ids.unsafeMemoryAccess(0);
                uint256 value = values.unsafeMemoryAccess(0);
                _doSafeTransferAcceptanceCheck(operator, from, to, id, value, data);
            } else {
                _doSafeBatchTransferAcceptanceCheck(operator, from, to, ids, values, data);
            }
        }
    }

    /**
     * @dev Performs an acceptance check by calling {IERC1155-onERC1155Received} on the `to` address
     * if it contains code at the moment of execution.
     */
    function _doSafeTransferAcceptanceCheck(
        address operator,
        address from,
        address to,
        uint256 id,
        uint256 value,
        bytes memory data
    ) private {
        if (to.code.length > 0) {
            try IERC1155Receiver(to).onERC1155Received(operator, from, id, value, data) returns (bytes4 response) {
                if (response != IERC1155Receiver.onERC1155Received.selector) {
                    // Tokens rejected
                    revert ERC1155Errors.ERC1155InvalidReceiver(to);
                }
            } catch (bytes memory reason) {
                if (reason.length == 0) {
                    // non-ERC1155Receiver implementer
                    revert ERC1155Errors.ERC1155InvalidReceiver(to);
                } else {
                    /// @solidity memory-safe-assembly
                    assembly {
                        revert(add(32, reason), mload(reason))
                    }
                }
            }
        }
    }

    /**
     * @dev Performs a batch acceptance check by calling {IERC1155-onERC1155BatchReceived} on the `to` address
     * if it contains code at the moment of execution.
     */
    function _doSafeBatchTransferAcceptanceCheck(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values,
        bytes memory data
    ) private {
        if (to.code.length > 0) {
            try IERC1155Receiver(to).onERC1155BatchReceived(operator, from, ids, values, data) returns (
                bytes4 response
            ) {
                if (response != IERC1155Receiver.onERC1155BatchReceived.selector) {
                    // Tokens rejected
                    revert ERC1155Errors.ERC1155InvalidReceiver(to);
                }
            } catch (bytes memory reason) {
                if (reason.length == 0) {
                    // non-ERC1155Receiver implementer
                    revert ERC1155Errors.ERC1155InvalidReceiver(to);
                } else {
                    /// @solidity memory-safe-assembly
                    assembly {
                        revert(add(32, reason), mload(reason))
                    }
                }
            }
        }
    }

    /**
     * @dev Creates an array in memory with only one value for each of the elements provided.
     */
    function _asSingletonArrays(
        uint256 element1,
        uint256 element2
    ) private pure returns (uint256[] memory array1, uint256[] memory array2) {
        /// @solidity memory-safe-assembly
        assembly {
            // Load the free memory pointer
            array1 := mload(0x40)
            // Set array length to 1
            mstore(array1, 1)
            // Store the single element at the next word after the length (where content starts)
            mstore(add(array1, 0x20), element1)

            // Repeat for next array locating it right after the first array
            array2 := add(array1, 0x40)
            mstore(array2, 1)
            mstore(add(array2, 0x20), element2)

            // Update the free memory pointer by pointing after the second array
            mstore(0x40, add(array2, 0x40))
        }
    }

}
