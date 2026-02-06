import { task } from "hardhat/config";
import { ArgumentType } from "hardhat/types/arguments";

export const mineTask = task("mine", "Mine a given number of blocks")
  .addOption({
    name: "blocks",
    description: "The number of blocks to mine",
    defaultValue: "300",
  })
  .setAction(() => import("./actions/mine.js"))
  .build();

export const blockTask = task("block", "Get the current block")
  .setAction(() => import("./actions/block.js"))
  .build();

export const purchaseTask = task("purchase", "Purchase a given token")
  .addOption({
    name: "collection",
    description: "The collection to mint on",
    type: ArgumentType.STRING,
    defaultValue: "",
  })
  .addOption({
    name: "tokenId",
    description: "The token ID to mint",
    type: ArgumentType.INT,
    defaultValue: 0,
  })
  .addOption({
    name: "count",
    description: "The number of mint events to kick off",
    type: ArgumentType.INT,
    defaultValue: 0,
  })
  .setAction(() => import("./actions/purchase.js"))
  .build();
