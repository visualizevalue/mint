import type { HardhatRuntimeEnvironment } from "hardhat/types/hre";

export default async function (_taskArguments: {}, hre: HardhatRuntimeEnvironment) {
  const { viem } = await hre.network.connect();
  const clients = await viem.getWalletClients();

  for (const client of clients) {
    console.log(client.account.address);
  }
}
