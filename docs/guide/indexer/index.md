# Mint Indexer

The Mint indexer is a service that indexes on-chain data from the Factory and Mint contracts to provide fast and efficient data access for clients.

## Overview

The indexer uses [Ponder](https://ponder.sh) as its core engine, providing real-time and historical blockchain data indexing. Data is stored in PostgreSQL using the Drizzle ORM, enabling powerful queries and data relationships.

The indexer:

- Tracks all collections created through Factory contracts
- Indexes minted artifacts and their metadata
- Maintains ownership records for all artifacts
- Resolves and caches ENS profile data
- Exposes a GraphQL API for clients to query indexed data
- Provides a dedicated profiles endpoint for user profile management

## Architecture

The indexer consists of several components:

### Event Handlers

Event handlers process blockchain events from the Factory and Mint contracts:

- **Factory**: Creation of new collections and collection updates
- **Mint**: Artifact minting, transfers, and metadata updates

### Database

The indexer uses a relational database structure to maintain relationships between:

- Accounts (creators and collectors)
- Collections
- Artifacts (minted tokens)
- Ownership records
- Profile data

### API Layer

The indexer exposes two API interfaces:

1. **GraphQL API** at the root domain for querying indexed data
2. **Profiles REST API** at `/profiles/:id` for looking up and updating user profiles by Ethereum address or ENS domain

## How It Works

When a new collection is created or an artifact is minted, the indexer:

1. Detects the relevant on-chain event
2. Processes the event data
3. Updates the database
4. Makes the new data available via the GraphQL API

For profile data, the indexer:

1. Resolves ENS names to addresses and vice versa
2. Fetches and caches associated profile metadata
3. Provides profile data through the dedicated `/profiles/:id` endpoint

## Getting Started

To set up and run the indexer locally:

```bash
cd indexer
pnpm install
pnpm dev
```

For deployment and configuration options, see the [Setup Guide](./setup.md).

