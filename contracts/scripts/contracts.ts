import hre from "hardhat";

async function main() {
  const myToken = await hre.viem.deployContract("Factory", []);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
