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
contract MockV2Factory is Initializable, UUPSUpgradeable, Ownable2StepUpgradeable {

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
    function initialize() public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();

        baseImplementation = address(0);
        baseRenderer = address(0);
    }

    /// @notice Expose the factory version.
    function version() external pure returns (uint) {
        return 999;
    }

    /// @dev Prevent unauthorized upgrades.
    function _authorizeUpgrade(address) internal override onlyOwner {}
}
