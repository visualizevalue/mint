import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getAddress, parseGwei, zeroAddress } from "viem";
import { toByteArray } from "@visualizevalue/mint-utils";
import { JALIL, TOKEN_TIME } from "./constants.js";
import { viem, networkHelpers, collectionFixture, itemMintedFixture, itemPreparedFixture } from "./fixtures.js";

describe("Mint", () => {

  describe("Creating", async () => {

    it("create an onchain artifact", async () => {
      const { mint, owner } = await networkHelpers.loadFixture(collectionFixture);

      const address = getAddress(owner.account.address);

      await viem.assertions.emitWithArgs(
        mint.write.create([
          "VVM1",
          "Lorem Ipsum dolor sit amet.",
          toByteArray(TOKEN_TIME),
          0,
          0n,
        ]),
        mint,
        "TransferSingle",
        [address, zeroAddress, address, 1n, 1n],
      );
    });

    it("create an offchain artifact", async () => {
      const { mint, owner } = await networkHelpers.loadFixture(collectionFixture);

      const address = getAddress(owner.account.address);

      await viem.assertions.emitWithArgs(
        mint.write.create([
          "VVM1",
          "Lorem Ipsum dolor sit amet.",
          toByteArray("ipfs://qmy3zdkwrqnwqenczocdrr3xgqfxjxmgefup4htqenbvwo"),
          0,
          0n,
        ]),
        mint,
        "TransferSingle",
        [address, zeroAddress, address, 1n, 1n],
      );
    });

    it("mints tokens with incremental token IDs", async () => {
      const { mint, owner } = await networkHelpers.loadFixture(itemMintedFixture);

      const address = getAddress(owner.account.address);

      await viem.assertions.emitWithArgs(
        mint.write.create([
          "VVM2",
          "Lorem Ipsum dolor sit amet.",
          toByteArray("ipfs://qmy3zdkwrqnwqenczocdrr3xgqfxjxmgefup4htqenbvwo"),
          0,
          0n,
        ]),
        mint,
        "TransferSingle",
        [address, zeroAddress, address, 2n, 1n],
      );
    });

    it("mints the first token to the artist", async () => {
      const { mint, owner } = await networkHelpers.loadFixture(itemMintedFixture);

      assert.equal(await mint.read.balanceOf([owner.account.address, 1n]), 1n);
    });

    it("prevents anyone but the contract owner to create an artifact", async () => {
      const { mint } = await networkHelpers.loadFixture(itemMintedFixture);

      await viem.assertions.revertWithCustomError(
        mint.write.create(
          [
            "VVM2",
            "Lorem Ipsum dolor sit amet.",
            toByteArray("ipfs://qmy3zdkwrqnwqenczocdrr3xgqfxjxmgefup4htqenbvwo"),
            0,
            0n,
          ],
          { account: JALIL },
        ),
        mint,
        "OwnableUnauthorizedAccount",
      );
    });

    it("prepare a large artifact across multiple transactions", async () => {
      const { mint, largeArtifact } = await networkHelpers.loadFixture(itemPreparedFixture);

      await mint.write.create(["PREPARED", "", toByteArray(""), 0, 0n]);

      const dataURI = await mint.read.uri([2n]);
      const json = Buffer.from(dataURI.substring(29), `base64`).toString();
      const data = JSON.parse(json);

      assert.equal(data.image, largeArtifact);
    });

    it("prepare a large artifact across multiple transactions and clear previous artifact", async () => {
      const { mint } = await networkHelpers.loadFixture(itemPreparedFixture);

      await mint.write.prepareArtifact([
        2n,
        toByteArray("Hello world"),
        true,
      ]);

      await mint.write.create(["PREPARED", "", toByteArray(""), 0, 0n]);

      const dataURI = await mint.read.uri([2n]) as string;
      const json = Buffer.from(dataURI.substring(29), `base64`).toString();
      const data = JSON.parse(json);

      assert.equal(data.image, "Hello world");
    });

    it("creates a token and overrieds previously prepared artifact", async () => {
      const { mint } = await networkHelpers.loadFixture(itemPreparedFixture);

      await mint.write.create([
        "VVM2",
        "Lorem Ipsum dolor sit amet.",
        toByteArray("ipfs://qmy3zdkwrqnwqenczocdrr3xgqfxjxmgefup4htqenbvwo"),
        0,
        0n,
      ]);

      const dataURI = await mint.read.uri([2n]);
      const json = Buffer.from(dataURI.substring(29), `base64`).toString();
      const data = JSON.parse(json);

      assert.equal(data.image, "ipfs://qmy3zdkwrqnwqenczocdrr3xgqfxjxmgefup4htqenbvwo");
    });

    it("creates a token with a previously prepared artifact", async () => {
      const { mint, largeArtifact } = await networkHelpers.loadFixture(itemPreparedFixture);

      await mint.write.create([
        "VVM2",
        "Lorem Ipsum dolor sit amet.",
        [],
        0,
        0n,
      ]);

      const dataURI = await mint.read.uri([2n]);
      const json = Buffer.from(dataURI.substring(29), `base64`).toString();
      const data = JSON.parse(json);

      assert.equal(data.image, largeArtifact);
    });

    it("prevents adding to artifact after token creation", async () => {
      const { mint } = await networkHelpers.loadFixture(itemMintedFixture);

      await viem.assertions.revertWithCustomError(
        mint.write.prepareArtifact([
          1n,
          toByteArray("Hello world"),
          true,
        ]),
        mint,
        "TokenAlreadyMinted",
      );
    });

    it("allows registering (and using) a new renderer", async () => {
      const { mint } = await networkHelpers.loadFixture(itemMintedFixture);

      const mockRenderer = await viem.deployContract("MockRenderer", []);

      await viem.assertions.emitWithArgs(
        mint.write.registerRenderer([mockRenderer.address]),
        mint,
        "NewRenderer",
        [getAddress(mockRenderer.address), 1n],
      );

      await mint.write.create([
        "mock",
        "",
        toByteArray("void"),
        1,
        19n,
      ]);

      const dataURI = await mint.read.uri([2n]);
      const json = Buffer.from(dataURI.substring(29), `base64`).toString();
      const data = JSON.parse(json);

      assert.equal(data.foo, "bar");
      assert.equal(data.data, "19");
    });

  });

  describe("Purchasing", async () => {

    it("allows buying an artifact at 3 gwei per gas", async () => {
      const { mint, owner } = await networkHelpers.loadFixture(itemMintedFixture);

      await networkHelpers.setNextBlockBaseFeePerGas(3_000_000_000n);

      await viem.assertions.emitWithArgs(
        mint.write.mint(
          [1n, 1n],
          { value: parseGwei((60000n * 3n).toString()) },
        ),
        mint,
        "NewMint",
        [1n, parseGwei((60000n * 3n).toString()), 1n, getAddress(owner.account.address)],
      );
    });

    it("allows buying an artifact at 10 gwei per gas", async () => {
      const { mint, owner } = await networkHelpers.loadFixture(itemMintedFixture);

      await networkHelpers.setNextBlockBaseFeePerGas(10_000_000_000n);

      await viem.assertions.emitWithArgs(
        mint.write.mint(
          [1n, 1n],
          { value: parseGwei((60000n * 10n).toString()) },
        ),
        mint,
        "NewMint",
        [1n, parseGwei((60000n * 10n).toString()), 1n, getAddress(owner.account.address)],
      );
    });

    it("allows buying multiple of an artifact", async () => {
      const { mint, owner } = await networkHelpers.loadFixture(itemMintedFixture);

      await networkHelpers.setNextBlockBaseFeePerGas(10_000_000_000n);

      await viem.assertions.emitWithArgs(
        mint.write.mint(
          [1n, 9n],
          { value: parseGwei((60000n * 10n * 9n).toString()) },
        ),
        mint,
        "NewMint",
        [1n, parseGwei((60000n * 10n).toString()), 9n, getAddress(owner.account.address)],
      );
    });

    it("prevents buying an artifact at 10 gwei per gas for less than the set price", async () => {
      const { mint } = await networkHelpers.loadFixture(itemMintedFixture);

      await networkHelpers.setNextBlockBaseFeePerGas(10_000_000_000n);

      await viem.assertions.revertWithCustomError(
        mint.write.mint(
          [1n, 1n],
          { value: parseGwei((60000n * 9n).toString()) },
        ),
        mint,
        "MintPriceNotMet",
      );
    });

    it("prevents buying many of an artifact and not paying for the amount", async () => {
      const { mint } = await networkHelpers.loadFixture(itemMintedFixture);

      await networkHelpers.setNextBlockBaseFeePerGas(10_000_000_000n);

      await viem.assertions.revertWithCustomError(
        mint.write.mint(
          [1n, 10n],
          { value: parseGwei((60000n * 10n * 9n).toString()) },
        ),
        mint,
        "MintPriceNotMet",
      );
    });

    it("prevents buying an artifact after the mint has closed", async () => {
      const { mint } = await networkHelpers.loadFixture(itemMintedFixture);

      await networkHelpers.time.increase(86_400);

      // We mint another token in the meantime to make sure we're checking against the actual token creation
      await mint.write.create([
        "VVM2",
        "Lorem Ipsum dolor sit amet.",
        [],
        0,
        0n,
      ]);

      await networkHelpers.setNextBlockBaseFeePerGas(10_000_000_000n);

      await viem.assertions.revertWithCustomError(
        mint.write.mint(
          [1n, 1n],
          { value: parseGwei((60000n * 10n).toString()) },
        ),
        mint,
        "MintClosed",
      );
    });

    it("prevents buying non existent artifacts", async () => {
      const { mint } = await networkHelpers.loadFixture(itemMintedFixture);

      await viem.assertions.revertWithCustomError(
        mint.write.mint(
          [9n, 1n],
          { value: parseGwei((60000n * 10n).toString()) },
        ),
        mint,
        "NonExistentToken",
      );
    });

    it("lets anyone buy a token", async () => {
      const { mint } = await networkHelpers.loadFixture(itemMintedFixture);

      await networkHelpers.setNextBlockBaseFeePerGas(10_000_000_000n);

      await viem.assertions.emitWithArgs(
        mint.write.mint(
          [1n, 10n],
          {
            value: parseGwei((60000n * 10n * 10n).toString()),
            account: JALIL,
          },
        ),
        mint,
        "TransferSingle",
        [JALIL, zeroAddress, JALIL, 1n, 10n],
      );
    });

  });

  describe("Reading", async () => {

    it("shows the correct token URI", async () => {
      const { mint } = await networkHelpers.loadFixture(itemMintedFixture);

      const dataURI = await mint.read.uri([1n]);
      const json = Buffer.from(dataURI.substring(29), `base64`).toString();
      const data = JSON.parse(json);

      assert.equal(data.name, `VVM1`);
      assert.equal(data.description, `Lorem Ipsum dolor sit amet.`);
      assert.equal(data.image, TOKEN_TIME);
    });

    it("calculates the mint end timestamp correctly", async () => {
      const { mint, publicClient } = await networkHelpers.loadFixture(collectionFixture);

      const hash = await mint.write.create(["FOO", "", toByteArray("BAR"), 0, 0n]);
      await publicClient.waitForTransactionReceipt({ hash });

      const until = await mint.read.mintOpenUntil([await mint.read.latestTokenId()]);
      const currentBlock = await publicClient.getBlock();

      assert.equal(currentBlock.timestamp + 86_400n, until);
    });

    it("shows the correct token owner / balance", async () => {
      const { mint, owner } = await networkHelpers.loadFixture(itemMintedFixture);

      assert.equal(await mint.read.balanceOf([owner.account.address, 1n]), 1n);
      assert.equal(await mint.read.balanceOf([JALIL, 1n]), 0n);

      await mint.write.safeTransferFrom([owner.account.address, JALIL, 1n, 1n, zeroAddress]);

      assert.equal(await mint.read.balanceOf([JALIL, 1n]), 1n);
    });

    it("throws on trying to retreive non existent tokens", async () => {
      const { mint } = await networkHelpers.loadFixture(itemMintedFixture);

      await viem.assertions.revertWithCustomError(
        mint.read.uri([9n]),
        mint,
        "NonExistentToken",
      );
    });

  });

  describe("Withdrawals", async () => {

    it("prevents non-owners from withdrawing the contract balance", async () => {
      const { mint } = await networkHelpers.loadFixture(itemMintedFixture);

      await networkHelpers.setNextBlockBaseFeePerGas(10_000_000_000n);

      const value = parseGwei((60000n * 10n * 10n).toString());

      await mint.write.mint(
        [1n, 10n],
        {
          value,
          account: JALIL,
        },
      );

      await viem.assertions.revertWithCustomError(
        mint.write.withdraw({ account: JALIL }),
        mint,
        "OwnableUnauthorizedAccount",
      );
    });

    it("allows owners to withdraw the contract balance", async () => {
      const { mint, owner } = await networkHelpers.loadFixture(itemMintedFixture);

      await networkHelpers.setNextBlockBaseFeePerGas(10_000_000_000n);

      const value = parseGwei((60000n * 10n * 10n).toString());

      await mint.write.mint(
        [1n, 10n],
        {
          value,
          account: JALIL,
        },
      );

      await viem.assertions.balancesHaveChanged(
        mint.write.withdraw({ account: owner.account }),
        [{ address: owner.account.address, amount: value }],
      );

      await mint.write.mint(
        [1n, 10n],
        {
          value,
          account: JALIL,
        },
      );

      await viem.assertions.emitWithArgs(
        mint.write.withdraw({ account: owner.account }),
        mint,
        "Withdrawal",
        [value],
      );
    });

  });

  describe("Ownership", async () => {

    it("exposes the owner of a collection", async () => {
      const { mint, owner } = await networkHelpers.loadFixture(itemMintedFixture);

      assert.equal((await mint.read.owner()).toLowerCase(), owner.account.address);
    });

    it("prevents non owners to transfer ownership", async () => {
      const { mint } = await networkHelpers.loadFixture(itemMintedFixture);

      await viem.assertions.revertWithCustomError(
        mint.write.transferOwnership([JALIL], { account: JALIL }),
        mint,
        "OwnableUnauthorizedAccount",
      );
    });

    it("allows owners to transfer ownership", async () => {
      const { mint, owner } = await networkHelpers.loadFixture(itemMintedFixture);

      await viem.assertions.emit(
        mint.write.transferOwnership([JALIL], { account: owner.account }),
        mint,
        "OwnershipTransferStarted",
      );

      await viem.assertions.emit(
        mint.write.acceptOwnership({ account: JALIL }),
        mint,
        "OwnershipTransferred",
      );
    });

  });

});
