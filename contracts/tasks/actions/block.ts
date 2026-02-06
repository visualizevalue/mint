import type { HardhatRuntimeEnvironment } from "hardhat/types/hre";

export default async function (_taskArguments: {}, hre: HardhatRuntimeEnvironment) {
  const { viem } = await hre.network.connect();
  const client = await viem.getPublicClient();

  console.log(await client.getBlockNumber());
}
