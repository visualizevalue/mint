// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

struct Token {
    string name;
    string description;
    string artifact;
    uint64 blockNumber;
    uint64 time;
    uint16 renderer;
    bool   interactive;
}
