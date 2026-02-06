import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getAddress, encodeAbiParameters } from "viem";
import { toByteArray } from "@visualizevalue/mint-utils";
import { P5_HELLO_WORLD_HTML_URL, P5_HELLO_WORLD_IMG, P5_HELLO_WORLD_SCRIPT, P5_HELLO_WORLD_SCRIPT_URL } from "./constants.js";
import { viem, networkHelpers, baseFixture, itemMintedFixture } from "./fixtures.js";

// Need to test on mainnet fork for this to work...
// `FORK_MAINNET=true hh test test/P5Renderer.ts`
describe("P5Renderer", { skip: true }, () => {
  it("should expose the name of a version", async () => {
    await networkHelpers.loadFixture(baseFixture);

    const artifactReader = await viem.deployContract("ArtifactReader", []);
    const renderer = await viem.deployContract("P5Renderer", [], {
      libraries: {
        ArtifactReader: artifactReader.address,
      },
    });

    assert.equal(await renderer.read.name(), "P5 Renderer");
    assert.equal(await renderer.read.version(), 1n);
  });

  it("allows minting (and reading) artifacts", async () => {
    const { artifactReader, mint } = await networkHelpers.loadFixture(itemMintedFixture);

    const p5Renderer = await viem.deployContract("P5Renderer", [], {
      libraries: {
        ArtifactReader: artifactReader.address,
      },
    });

    await viem.assertions.emitWithArgs(
      mint.write.registerRenderer([p5Renderer.address]),
      mint,
      "NewRenderer",
      [getAddress(p5Renderer.address), 1n],
    );

    const encodedArtifact = encodeAbiParameters(
      [{ type: "string", name: "image" }, { type: "string", name: "script" }],
      [P5_HELLO_WORLD_IMG, P5_HELLO_WORLD_SCRIPT],
    );

    await mint.write.create([
      "Hello World",
      "",
      toByteArray(encodedArtifact),
      1,
      0n,
    ]);

    // @ts-ignore
    const dataURI = await mint.read.uri([2n], { gas: 1_000_000_000 });

    const json = Buffer.from(dataURI.substring(29), `base64`).toString();
    const data = JSON.parse(json);

    assert.equal(data.image, P5_HELLO_WORLD_IMG);
    assert.equal(data.script_url, P5_HELLO_WORLD_SCRIPT_URL);
    assert.equal(data.animation_url, P5_HELLO_WORLD_HTML_URL);
  });

  it("should expose the image URI", async () => {
    const { artifactReader, mint } = await networkHelpers.loadFixture(itemMintedFixture);

    const p5Renderer = await viem.deployContract("P5Renderer", [], {
      libraries: {
        ArtifactReader: artifactReader.address,
      },
    });
    await mint.write.registerRenderer([p5Renderer.address]);

    const encodedArtifact = encodeAbiParameters(
      [{ type: "string", name: "image" }, { type: "string", name: "script" }],
      [P5_HELLO_WORLD_IMG, P5_HELLO_WORLD_SCRIPT],
    );

    await mint.write.create([
      "Hello World",
      "",
      toByteArray(encodedArtifact),
      1,
      0n,
    ]);

    const tokenData = await mint.read.get([2n]);
    const token = {
      name: tokenData[0],
      description: tokenData[1],
      artifact: tokenData[2],
      renderer: tokenData[3],
      mintedBlock: tokenData[4],
      closeAt: tokenData[5],
      data: tokenData[6],
    };

    const imageUri = await p5Renderer.read.imageURI([2n, token]);
    assert.equal(imageUri, P5_HELLO_WORLD_IMG);

    const animationUri = await p5Renderer.read.animationURI([2n, token]);
    assert.equal(animationUri, P5_HELLO_WORLD_HTML_URL);
  });

});
