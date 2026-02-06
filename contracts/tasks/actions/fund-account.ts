import type { HardhatRuntimeEnvironment } from "hardhat/types/hre";
import { parseEther } from "viem";

export default async function ({ address }: { address: string }, hre: HardhatRuntimeEnvironment) {
  const { viem } = await hre.network.connect();
  const [account] = await viem.getWalletClients();

  await account.sendTransaction({ to: address as `0x${string}`, value: parseEther("1") });
}
