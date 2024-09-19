# Mint Collection Contracts

The [`Mint.sol`](https://github.com/visualizevalue/mint/blob/main/contracts/contracts/Mint.sol)
contract serves as a standardized minting protocol.
It defines how art can be created and purchased.

The contracts implement the widely used [ERC1155](https://eips.ethereum.org/EIPS/eip-1155)
token standard, which is perfect for issuing many-of-one artifacts.

## Collection Creation

When creating Mint contracts, artists define the collection

- `image`
- `title`
- `symbol`
- `description`

This general information is encoded onchain for all Mint contracts,
and accessible via the `contractURI` getter function.

```solidity
/// @notice Get the metadata for this collection contract.
function contractURI() public view returns (string memory) {
    return ContractMetadata.uri(metadata);
}
```

## Token Count

The Mint contract keeps track of the latest token Id, and increments
that number on each new artifact creation

```solidity
/// @notice The most recently minted token id.
uint public latestTokenId;
```

## Custom Token Renderers

Every mint contract is hooked up to one default token metadata renderer
contract, but artists are free to register new renderers on their
collection contracts.

```solidity
/// @notice The token metadata renderers registered with this collection.
address[] public renderers;

/// @notice Let's the artist register a new renderer to use for future mints.
function registerRenderer(address renderer) external onlyOwner returns (uint) {
    renderers.push(renderer);
    uint index = renderers.length - 1;

    emit NewRenderer(renderer, index);

    return index;
}
```

Registering a renderer emits the `NewRenderer` event, which clients can listen to
and use to propagate a list of renderers to choose from during token creation.

## Artifact Creation

In order to create new artifacts, artists call the `create` function on the
Mint contract, specifying the token `name`, `description`, `artifact` contents,
the desired token `renderer` (by its index in the aforementioned renderer list)
and finally the remaining `192` bits for storing arbitrary data
that is later passed to the token metadata renderer.

```solidity
/// @notice Let's the artist create a new token.
function create(
    string  calldata tokenName,
    string  calldata tokenDescription,
    bytes[] calldata tokenArtifact,
    uint32  tokenRenderer,
    uint192 tokenData
) public onlyOwner {
    if (renderers.length < tokenRenderer + 1) revert NonExistentRenderer();

    ++ latestTokenId;

    Token storage token = tokens[latestTokenId];

    token.name        = tokenName;
    token.description = tokenDescription;
    token.blocks      = uint32(block.number - initBlock);
    token.renderer    = tokenRenderer;
    token.data        = tokenData;

    if (tokenArtifact.length > 0) {
        // Clear previously prepared artifact data.
        if (token.artifact.length > 0) {
            delete token.artifact;
        }

        // Write the token artifact to storage.
        for (uint8 i = 0; i < tokenArtifact.length; i++) {
            token.artifact.push(SSTORE2.write(tokenArtifact[i]));
        }
    }

    _mint(msg.sender, latestTokenId, 1, "");
}
```

Token artifacts are written to storage via the SSTORE2 mechanism to reduce
storage costs on write.

### Storing large artifacts onchain

For artifacts that don't fit into one `create` transaction, artists can
call `prepareArtifact` N times to write + append data to a yet-to-be-minted
token:

```solidity
/// @notice Let's the artist prepare artifacts that are too large to store in a single transaction.
function prepareArtifact(uint tokenId, bytes[] calldata tokenArtifact, bool clear) external onlyOwner {
    if (tokenId <= latestTokenId) revert TokenAlreadyMinted();

    Token storage token = tokens[tokenId];

    if (token.artifact.length > 0 && clear) { delete token.artifact; }

    // Write the token artifact to storage.
    for (uint8 i = 0; i < tokenArtifact.length; i++) {
        token.artifact.push(SSTORE2.write(tokenArtifact[i]));
    }
}
```

In this case, the `create` function has to be called with an empty artifact,
(otherwise it would be overridden). If one were to make a mistake during
artifact preparation, the `prepareArtifact` function provides the ability
to `clear` previously written data and start from scratch.

## Token Data

Token data is encoded into and stored in a `Token` struct onchain and kept
track of in the `tokens` getter. Each token writes 3 + N(artifact) slots
to the EVM storage. As mentioned earlier, the remaining 192 bits
are optional and can be used to pass custom data to renderers.

```solidity
struct Token {
    string  name;         // token name
    string  description; // token description
    address[] artifact; // artifact pointers (image/artwork) data
    uint32  renderer;  // index of renderer contract address
    uint32  blocks;   // delta since contract<>token creation
    uint192 data;    // optional data for the renderer
}

/// @notice Holds the metadata for each token within this collection.
mapping(uint => Token) public tokens;
```

As part of the ERC1155 token standard, Mint collections offer the `uri(uint)`
function to get the metadata for a particular token.

```solidity
/// @notice Get the metadata for a given token id.
function uri(uint tokenId) external override view returns (string memory) {
    if (tokenId > latestTokenId) revert NonExistentToken();

    Token memory token = tokens[tokenId];

    return IRenderer(renderers[token.renderer]).uri(tokenId, token, artifact(tokenId));
}
```

If one only wants to query the token artifact, there is a separate `artifact(uint)`
helper just for this purpose.

```solidity
/// @notice Read an artifact.
function artifact (uint tokenId) public view returns (bytes memory content) {
    Token memory token = tokens[tokenId];

    for (uint8 i = 0; i < token.artifact.length; i++) {
        content = abi.encodePacked(content, SSTORE2.read(token.artifact[i]));
    }
}
```

## Purchasing Tokens

Tokens are open to be minted for 7200 blocks (24 hours) after token creation.

```solidity
/// @notice Each mint is open for 24 hours (7200 ethereum blocks).
uint constant MINT_BLOCKS = 7200;
```

Client interfaces can query until which a mint stays open via the
`mintOpenUntil` helper.
```solidity
/// @notice Check until which block a mint is open.
function mintOpenUntil(uint tokenId) public view returns (uint) {
    return initBlock + tokens[tokenId].blocks + MINT_BLOCKS;
}
```

During the mint window, users can mint a token at a given `amount` via
the `mint()` function.

```solidity
/// @notice Let's collectors purchase a token during its mint window.
function mint(uint tokenId, uint amount) external payable {
    if (tokenId > latestTokenId) revert NonExistentToken();

    uint unitPrice = block.basefee * 60_000;
    uint mintPrice = unitPrice * amount;
    if (mintPrice > msg.value) revert MintPriceNotMet();

    if (mintOpenUntil(tokenId) < block.number) revert MintClosed();

    _mint(msg.sender, tokenId, amount, "");

    emit NewMint(tokenId, unitPrice, amount, msg.sender);
}
```

It expects the current block's gas fee * the storage cost (`block.basefee * 60_000`)
for each mint. This is an approximation and users are encouraged to overpay
slightly in order to accommodate price fluctuations between blocks.

## Withdrawing Funds

Proceeds from mints are stored in the contract. They can be batch-withdrawn
by the artist via the `withdraw` function:

```solidity
/// @notice Let's the artist withdraw the contract balance.
function withdraw() external onlyOwner {
    payable(owner()).transfer(address(this).balance);

    emit Withdrawal(address(this).balance);
}
```

## Token Burns

While not yet part of the core protocol, we imagine future burn to unique
ERC721 instantiations of generative Mint artifacts. To enable features
like that the Mint collection implements the `Burnable` ERC1155 trait
so artists and developers can create burn to redeem features on top
of their Mint tokens.

```solidity
/// @notice Burn a given token & amount.
function burn(address account, uint256 tokenId, uint256 amount) external {
    if (account != msg.sender && !isApprovedForAll(account, msg.sender)) {
        revert ERC1155MissingApprovalForAll(msg.sender, account);
    }

    _burn(account, tokenId, amount);
}
```
