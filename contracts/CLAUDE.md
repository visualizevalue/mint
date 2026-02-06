# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Visualize Value "Mint" — an ERC-1155 NFT minting platform. Artists deploy collections via a factory, create tokens with onchain artifacts, and collectors mint during 24-hour windows at basefee-linked pricing.

**Solidity 0.8.24 · Hardhat 3 · Viem (not ethers.js) · TypeScript (ESM)**

## Commands

```bash
npx hardhat compile                              # Compile contracts
npx hardhat test                                 # Run all tests
npx hardhat test test/Mint.ts                    # Run one test file
npx hardhat test --grep "pattern"                # Run tests matching pattern
npx tsc --noEmit                                 # Type check
REPORT_GAS=true npx hardhat test                 # Tests with gas reporting
npx hardhat coverage                             # Solidity coverage
npx hardhat ignition deploy ./ignition/modules/Factory.ts --network localhost  # Deploy
```

### Mainnet Fork

P5Renderer and P5RendererV2 tests depend on scripty.sol contracts deployed on mainnet. They are skipped by default and require a mainnet fork:

```bash
npx hardhat test test/P5Renderer.ts --network mainnetFork
npx hardhat test test/P5RendererV2.ts --network mainnetFork
```

Requires `MAINNET_URL` set in your environment (see `.env.example`).

## Architecture

### Contract Hierarchy

**Mint.sol** — Core ERC-1155 collection contract. Owns tokens, manages mint windows (24h), pricing (basefee × 60,000 per unit), and artifact storage. Each collection is an independent Mint instance.

**FactoryV1.sol** — UUPS-upgradeable factory. Two deployment paths:
- `create()` — Full new Mint contract (higher deploy cost, cheaper interactions)
- `clone()` — EIP-1167 minimal proxy (cheaper deploy, slight runtime overhead)

**Factory.sol** — ERC1967Proxy wrapping FactoryV1.

### Renderer Plugin System

Renderers implement `IRenderer` and are registered per-collection. Each token references a renderer index. The interface requires `uri()`, `imageURI()`, and `animationURI()`.

- **Renderer.sol** — Static image (base64 encoded from SSTORE2 artifact)
- **AnimationRenderer.sol** — Image + animation URL (artifact is ABI-encoded tuple)
- **P5Renderer.sol** — P5.js generative art with scripty.sol
- **P5RendererV2.sol** — Enhanced P5.js using scripty.sol v2 + ethfsFileStorage

### Storage & Libraries

- **SSTORE2** — Artifacts stored as contract bytecode via CREATE for gas-efficient reads
- **ArtifactReader** — Reads and concatenates multi-chunk SSTORE2 artifacts
- **ContractMetadata** — Generates collection-level metadata JSON
- **Clone** — EIP-1167 minimal proxy deployment

### Artifact System

Artifacts (SVG, images, scripts) are stored onchain via SSTORE2. Large artifacts that exceed a single transaction's gas limit are split across multiple `prepareArtifact()` calls before the token is created. The `Token.artifact` field is an array of SSTORE2 pointers that get concatenated on read.

## Testing

Tests use **node:test + node:assert/strict + Viem** with a fixture chain pattern:

`baseFixture` → `factoryFixture` → `collectionFixture` → `itemMintedFixture` → `itemPreparedFixture`

Each fixture builds on the previous. Fixtures are in `test/fixtures.ts`, constants (addresses, SVG data) in `test/constants.ts`. Uses `@visualizevalue/mint-utils` (workspace dependency at `../utils`) for `toByteArray()` and `chunkArray()`.

### Hardhat 3 Testing Notes

- Tests use `node:test` (not Mocha) and `node:assert/strict` (not Chai)
- Assertions use `viem.assertions.emit()`, `viem.assertions.emitWithArgs()`, `viem.assertions.revertWithCustomError()`, `viem.assertions.balancesHaveChanged()`
- Network connection: `await network.connect("hardhat")` — must specify `"hardhat"` to use the configured `blockGasLimit`
- Fixtures use `networkHelpers.loadFixture()` for snapshot/restore
- Tasks use the Hardhat 3 task builder API: `task("name", "desc").addOption({...}).setAction(() => import("./actions/file.js")).build()`
- Task actions are in separate files under `tasks/actions/` with lazy dynamic imports

### EDR Limitations

- The Hardhat 3 EDR has an internal gas cap (~16M) for `eth_call` when gas is explicitly specified — do NOT pass `{ gas: ... }` overrides to `read` calls
- Large calldata (>~25KB per transaction) can cause EDR failures — when calling `prepareArtifact()` with multiple byte arrays, use `chunkArray(..., 1)` to send one SSTORE2 write per transaction

## Deployment

Uses **Hardhat Ignition** with CREATE2 strategy for deterministic addresses. Deployment modules are in `ignition/modules/`, parameters per network in `ignition/parameters.*.json`.

Networks: mainnet, sepolia, holesky, localhost.

## Key Types

```solidity
struct Token {
    string    name;
    string    description;
    address[] artifact;     // SSTORE2 pointers
    uint32    renderer;     // Index into collection's renderers array
    uint32    mintedBlock;
    uint64    closeAt;      // Mint window end timestamp
    uint128   data;         // Renderer-specific data
}
```
