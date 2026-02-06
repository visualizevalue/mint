import { task } from "hardhat/config";

export const exportAbiFactoryTask = task("export:abi:factory:v1", "Exports the FactoryV1 ABI")
  .setAction(() => import("./actions/export-abi-factory.js"))
  .build();

export const exportAbiMintTask = task("export:abi:mint", "Exports the Mint ABI")
  .setAction(() => import("./actions/export-abi-mint.js"))
  .build();

export const exportAbiRendererTask = task("export:abi:renderer", "Exports the Renderer ABI")
  .setAction(() => import("./actions/export-abi-renderer.js"))
  .build();
