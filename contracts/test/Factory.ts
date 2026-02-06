import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getAddress, zeroAddress } from "viem";
import { toByteArray } from "@visualizevalue/mint-utils";
import { ICON, TOKEN_TIME } from "./constants.js";
import { viem, networkHelpers, collectionFixture, factoryFixture } from "./fixtures.js";

describe("Factory", function () {
  it("sets ownership on the factory", async function () {
    const { factory, owner } = await networkHelpers.loadFixture(factoryFixture);

    assert.equal(await factory.read.owner(), getAddress(owner.account.address));
  });

  it("exposes the factory version", async function () {
    const { factory } = await networkHelpers.loadFixture(factoryFixture);

    assert.equal(await factory.read.version(), 1n);
  });

  it("ensures only an owner can upgrade the factory", async function () {
    const { factory, owner } = await networkHelpers.loadFixture(factoryFixture);

    // Deploy our new implementation
    const mockV2Factory = await viem.deployContract("MockV2Factory");

    // Deploy our new implementation
    await factory.write.upgradeToAndCall([mockV2Factory.address, "0x"]);

    // Check the new version
    assert.equal(await factory.read.version(), 999n);

    // Make sure we maintain ownership as expected
    assert.equal(await factory.read.owner(), getAddress(owner.account.address));
  });

  it("creates a new Mint contract", async function () {
    const { factory } = await networkHelpers.loadFixture(factoryFixture);

    await viem.assertions.emit(
      factory.write.create([
        "VV Mints",
        "VVM",
        "Lorem Ipsum dolor sit amet.",
        toByteArray(TOKEN_TIME),
      ]),
      factory,
      "Created",
    );
  });

  it("clones a new Mint contract", async function () {
    const { factory } = await networkHelpers.loadFixture(factoryFixture);

    await factory.write.clone([
      "VV Mints",
      "VVM",
      "Lorem Ipsum dolor sit amet.",
      toByteArray(TOKEN_TIME),
    ]);
  });

  it("prevents reinitialization", async function () {
    const { mint, owner } = await networkHelpers.loadFixture(collectionFixture);

    await viem.assertions.revertWithCustomError(
      mint.write.init([
        "Nope", "NP", "Bad intent", toByteArray(""), zeroAddress, owner.account.address,
      ]),
      mint,
      "Initialized",
    );
  });

  it("sets the correct owner", async function () {
    const { mint, owner } = await networkHelpers.loadFixture(collectionFixture);

    assert.equal(await mint.read.owner(), getAddress(owner.account.address));
  });

  it("exposes the mint contracts version", async function () {
    const { mint } = await networkHelpers.loadFixture(collectionFixture);

    assert.equal(await mint.read.version(), 1n);
  });

  it("sets the correct contract data", async function () {
    const { mint } = await networkHelpers.loadFixture(collectionFixture);

    const dataURI = await mint.read.contractURI();
    const json = Buffer.from(dataURI.substring(29), `base64`).toString();
    const data = JSON.parse(json);

    assert.equal(data.name, `VV Mints`);
    assert.equal(data.symbol, `VVM`);
    assert.equal(data.description, `Lorem Ipsum dolor sit amet.`);
    assert.equal(data.image, ICON);
  });

  it("allows querying the created collections", async function () {
    const { mint, factory, publicClient, owner } = await networkHelpers.loadFixture(collectionFixture);

    const hash = await factory.write.create([
      "VV Mints 2",
      "VVM",
      "Lorem Ipsum dolor sit amet.",
      toByteArray(TOKEN_TIME),
    ]);
    await publicClient.waitForTransactionReceipt({ hash });
    const createdEvents = await factory.getEvents.Created();
    const mint2 = await viem.getContractAt("Mint", createdEvents[0].args.contractAddress as `0x${string}`);

    assert.equal(
      JSON.stringify(await factory.read.getCreatorCollections([owner.account.address])),
      JSON.stringify([mint.address, mint2.address]),
    );
  });
});
