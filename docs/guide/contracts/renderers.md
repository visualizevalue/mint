# Renderers

## About Renderers

Artifacts are stored as submitted by the user using SSTORE2.

When users call the `uri()` method, the token checks for its registered
renderer contract and hands off rendering of the metadata to
the specific token renderer.

```solidity{7}
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
They receive the `tokenId`, the `token` metadata (name, description, ...).

::: code-group

```solidity [IRenderer.sol]
interface IRenderer {
    function name () external pure returns (string memory);

    function version () external pure returns (uint version);

    function uri (uint tokenId, Token calldata token) external view returns (string memory);

    function imageURI (uint tokenId, Token calldata token) external view returns (string memory);

    function animationURI (uint tokenId, Token calldata token) external view returns (string memory);
}
```

```solidity [Token.sol]
struct Token {
    string  name;            // token name
    string  description;    // token description
    address[] artifact;    // artifact pointers (image/artwork) data
    uint32  renderer;     // index of renderer contract address
    uint32  mintedBlock; // creation block height of the token
    uint64  closeAt;    // timestamp of mint completion
    uint128 data;      // optional data for renderers
}
```

:::

How renderers generate the metadata is entirely up to them.

## Default Renderer

The base renderer implementation that ships with every
Mint contract by default simply returns
artifact data as a blob.

```solidity
contract Renderer is IRenderer {

    /// @notice Render the metadata URI of the token.
    function uri (uint tokenId, Token calldata token) external view returns (string memory) {
        bytes memory artifact = ArtifactReader.get(token);

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

## Renderer Extensions

### P5 Renderer

As an initial extension example, we have built a renderer for generating [p5.js](https://p5js.org/)
based artifacts onchain.

Check out the [`P5Renderer.sol`](https://github.com/visualizevalue/mint/blob/main/contracts/contracts/renderers/P5Renderer.sol) on Github.

This renderer also comes with its custom UI implementation to edit and preview the P5 script.

![](../../assets/renderer-ui-p5.png)

How this works under the hood is that we encode both the static asset and the script content
within the artifact bytecode, and decode it into its parts during rendering.

Also note how the renderer exposes both a `script_url` with just the artists' p5 script
and the complete `animation_url` with the entire encoded html page.

```solidity {9}
/// @notice Generate the JSON metadata for a given token.
///         We expect the static preview image and P5 script
//          to both be encoded in the artifact data.
function uri (
    uint tokenId,
    Token calldata token,
    bytes memory artifact
) external view returns (string memory) {
    (string memory image, string memory script) = abi.decode(artifact, (string, string));

    bytes memory dataURI = abi.encodePacked(
        '{',
            '"id": "', Strings.toString(tokenId), '",',
            '"name": "', token.name, '",',
            '"description": "', token.description, '",',
            '"image": "', image, '",',
            '"script_url": "data:text/javascript;base64,', Base64.encode(bytes(script)), '",',
            '"animation_url": "', generateHtml(token.name, script), '"',
        '}'
    );

    return string(
        abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(dataURI)
        )
    );
}
```

### Markdown Renderer

The Markdown Renderer is designed for text-based artifacts. The artifact is stored as raw markdown bytes.

Check out the [`MarkdownRenderer.sol`](https://github.com/visualizevalue/mint/blob/main/contracts/contracts/renderers/MarkdownRenderer.sol) on Github.

For the `image`, the renderer generates an on-chain SVG preview — a dark 400×400 card
showing the token name as a heading and a truncated, sanitized snippet of the markdown
content that fades out via a CSS mask gradient.

The full markdown content is exposed as a base64-encoded `data:text/markdown` data URI
via the `animation_url`.

```solidity
function uri (uint tokenId, Token calldata token) external view returns (string memory) {
    bytes memory artifact = ArtifactReader.get(token);

    bytes memory dataURI = abi.encodePacked(
        '{',
            '"id": "', Strings.toString(tokenId), '",',
            '"name": "', token.name, '",',
            '"description": "', token.description, '",',
            '"type": "markdown",',
            '"image": "', _generateSVGDataURI(token.name, artifact), '",',
            '"animation_url": "', _markdownDataURI(artifact), '"',
        '}'
    );

    return string(
        abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(dataURI)
        )
    );
}
```

To safely embed user content in SVG, the renderer sanitizes XML entities (`&`, `<`, `>`, `"`, `'`)
and truncates the preview to 800 bytes.

### Tone Renderer

The Tone Renderer powers audio-based artifacts using [Tone.js](https://tonejs.github.io/).
Like the P5 Renderer, the artifact is an ABI-encoded `(string image, string script)` tuple
containing a static preview image and a Tone.js script.

Check out the [`ToneRenderer.sol`](https://github.com/visualizevalue/mint/blob/main/contracts/contracts/renderers/ToneRenderer.sol) on Github.

The renderer assembles a self-contained HTML page via [scripty.sol](https://github.com/intartnft/scripty.sol)
that loads Tone.js (gzipped) from [EthFS](https://ethfs.xyz/) and runs the token's script.
The HTML is built using ScriptyBuilderV2 with the following structure:

- **Head:** `<title>` tag + `fullSizeCanvas.css` from EthFS
- **Body:** gzipped Tone.js from EthFS, a gunzip loader script, and the token's audio script

```solidity {2}
function uri (uint tokenId, Token calldata token) external view returns (string memory) {
    (string memory image, string memory script) = abi.decode(ArtifactReader.get(token), (string, string));

    bytes memory dataURI = abi.encodePacked(
        '{',
            '"id": "', Strings.toString(tokenId), '",',
            '"name": "', token.name, '",',
            '"description": "', token.description, '",',
            '"image": "', image, '",',
            '"animation_url": "', generateHtml(token.name, script), '"',
        '}'
    );

    return string(
        abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(dataURI)
        )
    );
}
```

The renderer also exposes a `scriptURI()` method that returns just the Tone.js script
as a `data:text/javascript` data URI.

### Community Renderers

Developers are invited to get creative and contribute their own to the ecosystem.

