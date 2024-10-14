// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

struct Token {
    string  name;         // token name
    string  description; // token description
    address[] artifact; // artifact pointers (image/artwork) data
    uint32  renderer;  // index of renderer contract address
    uint64  mintedAt; // timestamp of token creation
    uint160 data;    // optional data for renderers
}
