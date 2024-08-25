# Mint Contracts

This is a [hardhat](https://hardhat.org/) environment. Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Factory.ts --network localhost
```

## Recursive Artifacts

Recursion will be enabled via a new HTML/canvas based renderer.

Artifact Data Call: `artifact://${CONTRACT}/${TOKEN_ID}`.
In the context of Mint contracts, the `artifact://` scheme is implied. So URLs can simply be `${CONTRACT}/${TOKEN_ID}`.

You can call any other contract read function via an [ERC-4804](https://eips.ethereum.org/EIPS/eip-4804) compliant link (e.g. `web3://0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/balanceOf/vitalik.eth?returns=(uint256)`)
