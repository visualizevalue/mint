import { getAddress } from "viem";
import { task } from "hardhat/config";

const JALIL = getAddress(`0xe11Da9560b51f8918295edC5ab9c0a90E9ADa20B`);

export const accountsTask = task("accounts", "Prints the list of accounts")
  .setAction(() => import("./actions/accounts.js"))
  .build();

export const fundAccountTask = task("fund-account", "Funds an account for testing")
  .addOption({
    name: "address",
    description: "The wallet address to fund",
    defaultValue: JALIL,
  })
  .setAction(() => import("./actions/fund-account.js"))
  .build();
