// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";

import { Clone    } from "./../libraries/Clone.sol";
import { Mint     } from "./../Mint.sol";
import { Renderer } from "./../renderers/Renderer.sol";

/// @notice To mint is a human right.
/// @author Visualize Value
contract FactoryV1 is Initializable, UUPSUpgradeable, Ownable2StepUpgradeable {

    /// @dev Emitted when a new Mint contract is deployed.
    event Created(address indexed ownerAddress, address contractAddress);

    /// @dev The Mint contract implementation to base clones off.
    address private baseImplementation;

    /// @dev The base Renderer all Mint contracts are initialized with.
    address private baseRenderer;

    /// @dev Helper to keep track of created collections without the need for complex synching.
    mapping(address creator => address[] collections) private creatorCollections;

    /// @dev This is an implementation contract; Disable the initializer for non proxies.
    constructor() {
        _disableInitializers();
    }

    /// @dev Initialize the contract with a base clonable mint contract implementation.
    function initialize(address mint, address renderer) public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();

        baseImplementation = mint;
        baseRenderer = renderer;
    }

    /// @notice Deploy a new Mint contract with the specified metadata.
    /// This is more expensive to deploy but recommended when expecting more than a few hundred collectors.
    function create(
        string memory name,
        string memory symbol,
        string memory description,
        bytes[] calldata image
    ) external returns (address) {
        Mint mint = new Mint();

        mint.init(name, symbol, description, image, baseRenderer, msg.sender);

        address mintAddress = address(mint);

        creatorCollections[msg.sender].push(mintAddress);

        emit Created(msg.sender, mintAddress);

        return mintAddress;
    }

    /// @notice Deploy a copy of the base Mint contract.
    /// This is cheaper to deploy but adds a small overhead to each token interaction (mint/transfer/...).
    function clone(
        string memory name,
        string memory symbol,
        string memory description,
        bytes[] calldata image
    ) external returns (address) {
        address mintAddress = Clone.clone(baseImplementation);

        Mint(mintAddress).init(name, symbol, description, image, baseRenderer, msg.sender);

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

    /// @dev Prevent unauthorized upgrades.
    function _authorizeUpgrade(address) internal override onlyOwner {}
}
