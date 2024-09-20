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

/// @notice Lets the artist register a new renderer to use for future mints.
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
/// @notice Lets the artist create a new token.
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
/// @notice Lets the artist prepare artifacts that are too large to store in a single transaction.
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
/// @notice Lets collectors purchase a token during its mint window.
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
/// @notice Lets the artist withdraw the contract balance.
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

## Mint ABI

The ABI specific to the Mint protocol:

```json
[
  "error MintClosed()",
  "error MintPriceNotMet()",
  "error NonExistentRenderer()",
  "error NonExistentToken()",
  "error OwnableInvalidOwner(address owner)",
  "error OwnableUnauthorizedAccount(address account)",
  "error TokenAlreadyMinted()",
  "event NewMint(uint256 indexed tokenId, uint256 unitPrice, uint256 amount, address minter)",
  "event NewRenderer(address indexed renderer, uint256 indexed index)",
  "event URI(string value, uint256 indexed id)",
  "event Withdrawal(uint256 amount)",
  "function artifact(uint256 tokenId) view returns (bytes content)",
  "function burn(address account, uint256 tokenId, uint256 amount)",
  "function create(string tokenName, string tokenDescription, bytes[] tokenArtifact, uint32 tokenRenderer, uint192 tokenData)",
  "function initBlock() view returns (uint256)",
  "function latestTokenId() view returns (uint256)",
  "function metadata() view returns (string name, string symbol, string description)",
  "function mint(uint256 tokenId, uint256 amount) payable",
  "function mintOpenUntil(uint256 tokenId) view returns (uint256)",
  "function prepareArtifact(uint256 tokenId, bytes[] tokenArtifact, bool clear)",
  "function registerRenderer(address renderer) returns (uint256)",
  "function renderers(uint256) view returns (address)",
  "function tokens(uint256) view returns (string name, string description, uint32 renderer, uint32 blocks, uint192 data)",
  "function uri(uint256 tokenId) view returns (string)",
  "function version() view returns (uint256)",
  "function withdraw()"
]
```

As Mint contracts implement the ERC1155 standard, it also supports all of
its public getters and methods. Check the full ABI below.

::: details Click to view complete ABI
```json
[
  "error ERC1155InsufficientBalance(address sender, uint256 balance, uint256 needed, uint256 tokenId)",
  "error ERC1155InvalidApprover(address approver)",
  "error ERC1155InvalidArrayLength(uint256 idsLength, uint256 valuesLength)",
  "error ERC1155InvalidOperator(address operator)",
  "error ERC1155InvalidReceiver(address receiver)",
  "error ERC1155InvalidSender(address sender)",
  "error ERC1155MissingApprovalForAll(address operator, address owner)",
  "error Initialized()",
  "error MintClosed()",
  "error MintPriceNotMet()",
  "error NonExistentRenderer()",
  "error NonExistentToken()",
  "error OwnableInvalidOwner(address owner)",
  "error OwnableUnauthorizedAccount(address account)",
  "error TokenAlreadyMinted()",
  "event ApprovalForAll(address indexed account, address indexed operator, bool approved)",
  "event NewMint(uint256 indexed tokenId, uint256 unitPrice, uint256 amount, address minter)",
  "event NewRenderer(address indexed renderer, uint256 indexed index)",
  "event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner)",
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
  "event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)",
  "event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)",
  "event URI(string value, uint256 indexed id)",
  "event Withdrawal(uint256 amount)",
  "function acceptOwnership()",
  "function artifact(uint256 tokenId) view returns (bytes content)",
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])",
  "function burn(address account, uint256 tokenId, uint256 amount)",
  "function contractURI() view returns (string)",
  "function create(string tokenName, string tokenDescription, bytes[] tokenArtifact, uint32 tokenRenderer, uint192 tokenData)",
  "function init(string contractName, string contractSymbol, string contractDescription, bytes[] contractImage, address renderer, address owner)",
  "function initBlock() view returns (uint256)",
  "function isApprovedForAll(address account, address operator) view returns (bool)",
  "function latestTokenId() view returns (uint256)",
  "function metadata() view returns (string name, string symbol, string description)",
  "function mint(uint256 tokenId, uint256 amount) payable",
  "function mintOpenUntil(uint256 tokenId) view returns (uint256)",
  "function owner() view returns (address)",
  "function pendingOwner() view returns (address)",
  "function prepareArtifact(uint256 tokenId, bytes[] tokenArtifact, bool clear)",
  "function registerRenderer(address renderer) returns (uint256)",
  "function renderers(uint256) view returns (address)",
  "function renounceOwnership()",
  "function safeBatchTransferFrom(address from, address to, uint256[] ids, uint256[] values, bytes data)",
  "function safeTransferFrom(address from, address to, uint256 id, uint256 value, bytes data)",
  "function setApprovalForAll(address operator, bool approved)",
  "function supportsInterface(bytes4 interfaceId) view returns (bool)",
  "function tokens(uint256) view returns (string name, string description, uint32 renderer, uint32 blocks, uint192 data)",
  "function transferOwnership(address newOwner)",
  "function uri(uint256 tokenId) view returns (string)",
  "function version() view returns (uint256)",
  "function withdraw()"
]
```
:::
