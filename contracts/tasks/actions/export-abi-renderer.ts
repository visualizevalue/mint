import type { HardhatRuntimeEnvironment } from "hardhat/types/hre";
import { formatAbi } from "abitype";

export default async function (_taskArguments: {}, hre: HardhatRuntimeEnvironment) {
  const { viem } = await hre.network.connect();

  const artifactReader = await viem.deployContract("ArtifactReader", []);

  const renderer = await viem.deployContract("Renderer", [], {
    libraries: {
      ArtifactReader: artifactReader.address,
    },
  });

  console.log(formatAbi(renderer.abi));
}
