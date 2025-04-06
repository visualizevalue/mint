// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import { MintViaERC20 } from "./../MintViaERC20.sol";

/// @notice Factory for creating MintViaERC20 contracts.
/// @author Visualize Value
contract FactoryERC20Mints {

    /// @dev Emitted when a new MintViaERC20 contract is deployed.
    event Created(address indexed ownerAddress, address contractAddress);

    /// @dev The base Renderer all Mint contracts are initialized with.
    address private immutable baseRenderer;

    /// @dev Helper to keep track of created collections without the need for complex synching.
    mapping(address creator => address[] collections) private creatorCollections;

    /// @dev Initialize the contract with a base renderer.
    constructor(address renderer) {
        baseRenderer = renderer;
    }

    /// @notice Deploy a new MintViaERC20 contract with the specified metadata.
    function create(
        string memory name,
        string memory symbol,
        string memory description,
        bytes[] calldata image
    ) external returns (address) {
        MintViaERC20 mint = new MintViaERC20();

        mint.init(name, symbol, description, image, baseRenderer, msg.sender);

        address mintAddress = address(mint);

        creatorCollections[msg.sender].push(mintAddress);

        emit Created(msg.sender, mintAddress);

        return mintAddress;
    }

    /// @notice Access created collections without the need for historical syncs.
    function getCreatorCollections(address creator) external view returns (address[] memory) {
        return creatorCollections[creator];
    }

    /// @notice Expose the factory version.
    function version() external pure returns (uint) {
        return 1;
    }
}