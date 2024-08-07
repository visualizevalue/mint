// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

struct Token {
    string  name;
    string  description;
    string  artifact;
    uint16  renderer;
    uint240 data; // optional data for renderer
}
