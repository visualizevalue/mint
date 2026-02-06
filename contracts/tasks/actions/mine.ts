import type { HardhatRuntimeEnvironment } from "hardhat/types/hre";

export default async function ({ blocks }: { blocks: string }, hre: HardhatRuntimeEnvironment) {
  const { networkHelpers } = await hre.network.connect();
  await networkHelpers.mine(BigInt(blocks));
}
