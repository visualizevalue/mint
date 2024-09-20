# Renderers

Artifacts are stored as submitted by the user using SSTORE2.

When users call the `uri()` method, the token checks for its registered
renderer contract and hands off rendering of the metadata to
the specific token renderer.

```solidity
/// @notice Get the metadata for a given token id.
function uri(uint tokenId) external override view returns (string memory) {
    if (tokenId > latestTokenId) revert NonExistentToken();

    Token memory token = tokens[tokenId];

    return IRenderer(renderers[token.renderer]).uri(tokenId, token, artifact(tokenId));
}

/// @notice Read an artifact.
function artifact (uint tokenId) public view returns (bytes memory content) {
    Token memory token = tokens[tokenId];

    for (uint8 i = 0; i < token.artifact.length; i++) {
        content = abi.encodePacked(content, SSTORE2.read(token.artifact[i]));
    }
}
```

All renderers have to implement the simple `IRenderer` interface.
They receive the `tokenId`, the `token` metadata (name, description, ...)
and the resolved `artifact` data.

```solidity
interface IRenderer {
    function uri (uint tokenId, Token calldata token, bytes memory artifact) external view returns (string memory);
}

/// Token data is passed to the renderer, as well as the artifact data.
struct Token {
    string  name;         // token name
    string  description; // token description
    address[] artifact; // artifact pointers (image/artwork) data
    uint32  renderer;  // index of renderer contract address
    uint32  blocks;   // delta since contract<>token creation
    uint192 data;    // optional data for the renderer
}
```

How renderers generate the metadata is entirely up to them.
The base renderer implementation that ships with every
Mint contract by default simply returns
artifact data as a blob.

```solidity
contract Renderer is IRenderer {

    function uri (uint tokenId, Token calldata token, bytes memory artifact) external pure returns (string memory) {
        bytes memory dataURI = abi.encodePacked(
            '{',
                '"id": "', Strings.toString(tokenId), '",',
                '"name": "', token.name, '",',
                '"description": "', token.description, '",',
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

}
```

We're working on an onchain P5 renderer, but developers are invited to
get creative and contribute their own to the ecosystem.
