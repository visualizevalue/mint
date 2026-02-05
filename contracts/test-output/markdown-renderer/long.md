# On-Chain Markdown

> To mint is a human right.

## Introduction

This document demonstrates how **markdown content** can be stored entirely on-chain as an NFT artifact. The renderer generates a preview SVG and serves the raw markdown via `animation_url`.

## How It Works

1. The artist writes markdown content
2. The content is stored on-chain via SSTORE2
3. The renderer generates an SVG preview image
4. The full markdown is served as a `data:text/markdown` URI

## Code Example

```solidity
function mint(string memory content) external {
    // Store markdown on-chain
    create("My Post", "A description", toByteArray(content), rendererIndex, 0);
}
```

## Features

- **On-chain storage** — content lives forever on Ethereum
- **SVG preview** — generated image for marketplace display
- **Raw access** — full markdown available via animation_url
- **Special chars** — handles <html>, "quotes", & ampersands safely

---

*Built with the Visualize Value Mint protocol.*