import { task } from "hardhat/config";
import { ArgumentType } from "hardhat/types/arguments";

export const interactMintUriTask = task("interact:mint:uri", "Query a token URI")
  .addOption({
    name: "address",
    description: "The mint contract address",
    type: ArgumentType.STRING,
    defaultValue: "",
  })
  .addOption({
    name: "tokenId",
    description: "The token id to query",
    type: ArgumentType.STRING,
    defaultValue: "",
  })
  .setAction(() => import("./actions/interact-mint-uri.js"))
  .build();
