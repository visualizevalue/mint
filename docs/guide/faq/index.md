# FAQs

## Are the contracts upgradeable?

The `Factory.sol` contract through which artists can deploy their collections is upgradeable.
When doing so, the `Mint.sol` contract instantiations they create are fully immutable
and owned by the artists themselves. No upgrade can ever affect existing Mint collections.

## Can I add WalletConnect to my app?

Yes – just add a `NUXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` environment variable
with your project id.
Create one for your domain at the [WalletConnect cloud](https://cloud.walletconnect.com)

