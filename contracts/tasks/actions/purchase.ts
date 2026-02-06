import type { HardhatRuntimeEnvironment } from "hardhat/types/hre";
import { takeRandom, delay } from "@visualizevalue/mint-utils";
import type { Client } from "viem";

export default async function (
  { collection, tokenId, count }: { collection: `0x${string}`; tokenId: number; count: number },
  hre: HardhatRuntimeEnvironment,
) {
  const { viem } = await hre.network.connect();
  const clients = await viem.getWalletClients();
  const contract = await viem.getContractAt("Mint", collection);
  const client = await viem.getPublicClient();

  for (let i = 0; i < count; i++) {
    await delay(500);
    const user = takeRandom(clients) as Client;
    const amount = BigInt(parseInt((Math.random() * 10 + 1).toString()));
    await contract.write.mint([tokenId, amount], {
      value: (await client.getGasPrice()) * 60_000n * BigInt(amount),
      account: user.account,
    });
  }
}
