import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { TOKEN_TIME } from "./constants.js";
import { viem, networkHelpers, itemMintedFixture } from "./fixtures.js";

describe("Renderer", async () => {

  it("should expose the name and version", async () => {
    const { mint } = await networkHelpers.loadFixture(itemMintedFixture);

    const rendererAddress = await mint.read.renderers([0n]);
    const renderer = await viem.getContractAt("Renderer", rendererAddress);

    assert.equal(await renderer.read.name(), "Base Renderer");
    assert.equal(await renderer.read.version(), 1n);
  });

  it("should expose the token URI", async () => {
    const { mint } = await networkHelpers.loadFixture(itemMintedFixture);

    const rendererAddress = await mint.read.renderers([0n]);
    const renderer = await viem.getContractAt("Renderer", rendererAddress);

    const tokenData = await mint.read.get([1n]);
    const token = {
      name: tokenData[0],
      description: tokenData[1],
      artifact: tokenData[2],
      renderer: tokenData[3],
      mintedBlock: tokenData[4],
      closeAt: tokenData[5],
      data: tokenData[6],
    };

    const uri = await renderer.read.uri([1n, token]);
    const json = Buffer.from(uri.substring(29), `base64`).toString();
    const data = JSON.parse(json);

    assert.equal(data.name, `VVM1`);
    assert.equal(data.description, `Lorem Ipsum dolor sit amet.`);
    assert.equal(data.image, TOKEN_TIME);
  });

  it("should expose the image URI", async () => {
    const { mint } = await networkHelpers.loadFixture(itemMintedFixture);

    const rendererAddress = await mint.read.renderers([0n]);
    const renderer = await viem.getContractAt("Renderer", rendererAddress);

    const tokenData = await mint.read.get([1n]);
    const token = {
      name: tokenData[0],
      description: tokenData[1],
      artifact: tokenData[2],
      renderer: tokenData[3],
      mintedBlock: tokenData[4],
      closeAt: tokenData[5],
      data: tokenData[6],
    };

    const uri = await renderer.read.imageURI([1n, token]);
    assert.equal(uri, TOKEN_TIME);
  });

  it("should expose the animation URI", async () => {
    const { mint } = await networkHelpers.loadFixture(itemMintedFixture);

    const rendererAddress = await mint.read.renderers([0n]);
    const renderer = await viem.getContractAt("Renderer", rendererAddress);

    const tokenData = await mint.read.get([1n]);
    const token = {
      name: tokenData[0],
      description: tokenData[1],
      artifact: tokenData[2],
      renderer: tokenData[3],
      mintedBlock: tokenData[4],
      closeAt: tokenData[5],
      data: tokenData[6],
    };

    const uri = await renderer.read.animationURI([1n, token]);
    assert.equal(uri, "");
  });

});
