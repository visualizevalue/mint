// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";

import { Clone         } from "./../libraries/Clone.sol";
import { Mint          } from "./../Mint.sol";
import { MintViaERC20  } from "./../MintViaERC20.sol";
import { Renderer      } from "./../renderers/Renderer.sol";

/// TODO: Review
/// @notice Factory V2 that supports both ETH and ERC20 based mint contracts.
/// @author Visualize Value
contract FactoryV2 is Initializable, UUPSUpgradeable, Ownable2StepUpgradeable {
    /// @dev Mint contract types that can be deployed.
    enum MintType {
        ETH,
        ERC20
    }

    /// @dev Emitted when a new Mint contract is deployed.
    event Created(address indexed ownerAddress, address contractAddress, MintType indexed mintType);

    /// @dev The ETH Mint contract implementation to base clones off.
    address private baseETHImplementation;

    /// @dev The ERC20 Mint contract implementation to base clones off.
    address private baseERC20Implementation;

    /// @dev The base Renderer all Mint contracts are initialized with.
    address private baseRenderer;

    /// @dev Helper to keep track of created collections without the need for complex synching.
    mapping(address creator => address[] collections) private creatorCollections;

    /// @dev Mapping to track which mint type was used for each collection
    mapping(address collection => MintType mintType) private collectionTypes;

    /// @dev This is an implementation contract; Disable the initializer for non proxies.
    constructor() {
        _disableInitializers();
    }

    /// @dev Initialize the contract with base clonable mint contract implementations.
    function initialize(address ethMint, address erc20Mint, address renderer) public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();

        baseETHImplementation = ethMint;
        baseERC20Implementation = erc20Mint;
        baseRenderer = renderer;
    }

    /// @notice Deploy a new ETH-based Mint contract with the specified metadata.
    /// This is more expensive to deploy but recommended when expecting more than a few hundred collectors.
    function createETHMint(
        string memory name,
        string memory symbol,
        string memory description,
        bytes[] calldata image
    ) external returns (address) {
        Mint mint = new Mint();

        mint.init(name, symbol, description, image, baseRenderer, msg.sender);

        address mintAddress = address(mint);

        creatorCollections[msg.sender].push(mintAddress);
        collectionTypes[mintAddress] = MintType.ETH;

        emit Created(msg.sender, mintAddress, MintType.ETH);

        return mintAddress;
    }

    /// @notice Deploy a new ERC20-based Mint contract with the specified metadata.
    /// This is more expensive to deploy but recommended when expecting more than a few hundred collectors.
    function createERC20Mint(
        string memory name,
        string memory symbol,
        string memory description,
        bytes[] calldata image
    ) external returns (address) {
        MintViaERC20 mint = new MintViaERC20();

        mint.init(name, symbol, description, image, baseRenderer, msg.sender);

        address mintAddress = address(mint);

        creatorCollections[msg.sender].push(mintAddress);
        collectionTypes[mintAddress] = MintType.ERC20;

        emit Created(msg.sender, mintAddress, MintType.ERC20);

        return mintAddress;
    }

    /// @notice Deploy a copy of the base ETH-based Mint contract.
    /// This is cheaper to deploy but adds a small overhead to each token interaction (mint/transfer/...).
    function cloneETHMint(
        string memory name,
        string memory symbol,
        string memory description,
        bytes[] calldata image
    ) external returns (address) {
        address mintAddress = Clone.clone(baseETHImplementation);

        Mint(mintAddress).init(name, symbol, description, image, baseRenderer, msg.sender);

        creatorCollections[msg.sender].push(mintAddress);
        collectionTypes[mintAddress] = MintType.ETH;

        emit Created(msg.sender, mintAddress, MintType.ETH);

        return mintAddress;
    }

    /// @notice Deploy a copy of the base ERC20-based Mint contract.
    /// This is cheaper to deploy but adds a small overhead to each token interaction (mint/transfer/...).
    function cloneERC20Mint(
        string memory name,
        string memory symbol,
        string memory description,
        bytes[] calldata image
    ) external returns (address) {
        address mintAddress = Clone.clone(baseERC20Implementation);

        MintViaERC20(mintAddress).init(name, symbol, description, image, baseRenderer, msg.sender);

        creatorCollections[msg.sender].push(mintAddress);
        collectionTypes[mintAddress] = MintType.ERC20;

        emit Created(msg.sender, mintAddress, MintType.ERC20);

        return mintAddress;
    }

    /// @notice Access created collections without the need for historical syncs.
    function getCreatorCollections(address creator) external view returns (address[] memory) {
        return creatorCollections[creator];
    }

    /// @notice Get the mint type of a specific collection.
    function getCollectionType(address collection) external view returns (MintType) {
        return collectionTypes[collection];
    }

    /// @notice Expose the factory version.
    function version() external pure returns (uint) {
        return 2;
    }

    /// @dev Prevent unauthorized upgrades.
    function _authorizeUpgrade(address) internal override onlyOwner {}
}
