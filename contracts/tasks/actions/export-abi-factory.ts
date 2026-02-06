import type { HardhatRuntimeEnvironment } from "hardhat/types/hre";
import { formatAbi } from "abitype";

export default async function (_taskArguments: {}, hre: HardhatRuntimeEnvironment) {
  const { viem } = await hre.network.connect();

  const contractMetadata = await viem.deployContract("ContractMetadata", []);

  const factory = await viem.deployContract("FactoryV1", [], {
    libraries: {
      ContractMetadata: contractMetadata.address,
    },
  });

  console.log(formatAbi(factory.abi));
}
