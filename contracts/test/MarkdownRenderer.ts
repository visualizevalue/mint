import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import { toByteArray } from "@visualizevalue/mint-utils";
import { viem, networkHelpers, itemMintedFixture } from "./fixtures.js";

const MARKDOWN = `# Hello World

This is a **markdown** document.

## Features

- Item one
- Item two
- Item three

Some \`inline code\` and more text.`;

const MARKDOWN_WITH_SPECIAL_CHARS = `# Title <script>alert("xss")</script>

This has & ampersands and <angle brackets>.`;

describe("MarkdownRenderer", async () => {
  let artifactReader: any, mint: any, renderer: any;

  beforeEach(async () => {
    const { artifactReader: ar, mint: m } = await networkHelpers.loadFixture(itemMintedFixture);

    artifactReader = ar;
    mint = m;

    renderer = await viem.deployContract("MarkdownRenderer", [], {
      libraries: {
        ArtifactReader: artifactReader.address,
      },
    });

    await mint.write.registerRenderer([renderer.address]);
  });

  it("should expose the name and version", async () => {
    assert.equal(await renderer.read.name(), "Markdown Renderer");
    assert.equal(await renderer.read.version(), 1n);
  });

  it("allows minting and reading markdown artifacts", async () => {
    await mint.write.create([
      "My Post",
      "A markdown post.",
      toByteArray(MARKDOWN),
      1,
      0n,
    ]);

    const dataURI = await mint.read.uri([2n]);

    const json = Buffer.from(dataURI.substring(29), `base64`).toString();
    const data = JSON.parse(json);

    assert.equal(data.id, "2");
    assert.equal(data.name, "My Post");
    assert.equal(data.description, "A markdown post.");
    assert.equal(data.type, "markdown");
    assert.ok(data.image.startsWith("data:image/svg+xml;base64,"));
    assert.ok(data.animation_url.startsWith("data:text/markdown;base64,"));

    // Decode animation_url to verify original markdown
    const markdown = Buffer.from(data.animation_url.substring(26), "base64").toString();
    assert.equal(markdown, MARKDOWN);
  });

  it("should expose the image and animation URIs individually", async () => {
    await mint.write.create([
      "Post",
      "",
      toByteArray(MARKDOWN),
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
    assert.ok(imageUri.startsWith("data:image/svg+xml;base64,"));

    // Decode SVG and verify it contains the token name
    const svg = Buffer.from(imageUri.substring(26), "base64").toString();
    assert.ok(svg.includes("Post"));

    const animationUri = await renderer.read.animationURI([2n, token]);
    assert.ok(animationUri.startsWith("data:text/markdown;base64,"));

    const markdown = Buffer.from(animationUri.substring(26), "base64").toString();
    assert.equal(markdown, MARKDOWN);
  });

  it("should escape special characters in SVG preview", async () => {
    await mint.write.create([
      "Special <Chars>",
      "",
      toByteArray(MARKDOWN_WITH_SPECIAL_CHARS),
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
    const svg = Buffer.from(imageUri.substring(26), "base64").toString();

    // Title should have escaped angle brackets
    assert.ok(svg.includes("Special &lt;Chars&gt;"));
    // Content should have escaped characters
    assert.ok(svg.includes("&amp;"));
    assert.ok(svg.includes("&lt;"));

    // Raw markdown in animation_url should be unescaped
    const animationUri = await renderer.read.animationURI([2n, token]);
    const markdown = Buffer.from(animationUri.substring(26), "base64").toString();
    assert.equal(markdown, MARKDOWN_WITH_SPECIAL_CHARS);
  });
});
