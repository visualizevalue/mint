import type { HardhatRuntimeEnvironment } from "hardhat/types/hre";

export default async function (
  { address, tokenId }: { address: string; tokenId: string },
  hre: HardhatRuntimeEnvironment,
) {
  const { viem } = await hre.network.connect();
  const mint = await viem.getContractAt("Mint", address as `0x${string}`);

  // @ts-ignore
  const dataURI = await mint.read.uri([BigInt(tokenId)], { gas: 1_000_000_000 });

  console.log(dataURI);

  const json = Buffer.from(dataURI.substring(29), `base64`).toString();
  const data = JSON.parse(json);

  console.log(data);
}
