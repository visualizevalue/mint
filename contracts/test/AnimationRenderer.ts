import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import { encodeAbiParameters } from "viem";
import { toByteArray } from "@visualizevalue/mint-utils";
import { viem, networkHelpers, itemMintedFixture } from "./fixtures.js";

describe("AnimationRenderer", async () => {
  let artifactReader: any, mint: any, renderer: any;

  beforeEach(async () => {
    const { artifactReader: ar, mint: m } = await networkHelpers.loadFixture(itemMintedFixture);

    artifactReader = ar;
    mint = m;

    renderer = await viem.deployContract("AnimationRenderer", [], {
      libraries: {
        ArtifactReader: artifactReader.address,
      },
    });

    await mint.write.registerRenderer([renderer.address]);
  });

  it("should expose the name of a version", async () => {
    assert.equal(await renderer.read.name(), "Animation Renderer");
    assert.equal(await renderer.read.version(), 1n);
  });

  it("allows minting (and reading) artifacts", async () => {
    const encodedArtifact = encodeAbiParameters(
      [{ type: "string", name: "image" }, { type: "string", name: "animation" }],
      ["ipfs://image", "ipfs://video"],
    );

    await mint.write.create([
      "Time",
      "",
      toByteArray(encodedArtifact),
      1,
      0n,
    ]);

    const dataURI = await mint.read.uri([2n]);

    const json = Buffer.from(dataURI.substring(29), `base64`).toString();
    const data = JSON.parse(json);

    assert.equal(data.image, "ipfs://image");
    assert.equal(data.animation_url, "ipfs://video");
  });

  it("should expose the image and animation URIs individually", async () => {
    const encodedArtifact = encodeAbiParameters(
      [{ type: "string", name: "image" }, { type: "string", name: "animation" }],
      ["ipfs://image", "ipfs://video"],
    );

    await mint.write.create([
      "Token",
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

    const imageUri = await renderer.read.imageURI([2n, token]);
    assert.equal(imageUri, "ipfs://image");

    const animationUri = await renderer.read.animationURI([2n, token]);
    assert.equal(animationUri, "ipfs://video");
  });

});
