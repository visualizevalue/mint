# Setting Up the Indexer

This guide will walk you through setting up and running the Mint indexer.

## Prerequisites

Before setting up the indexer, ensure you have:

- Node.js 18 or later
- PostgreSQL database
- Ethereum RPC provider (Alchemy, Infura, or similar)
- pnpm (for package management)

## Installation

Clone the repository and install dependencies:

```bash
# Install dependencies
cd indexer
pnpm install
```

## Configuration

The indexer requires several environment variables to be configured via a `.env.local` file:

```bash
# RPC URL used for fetching blockchain data.
PONDER_RPC_URL_1=

DATABASE_URL=postgresql://
DATABASE_SCHEMA=mint

FETCH_COLLECTOR_ENS=false

PONDER_TELEMETRY_DISABLED=true
```

You can set these in a `.env` file in the indexer directory.

## Database Setup

The indexer uses Drizzle ORM with migrations for the non-ponder databases (e.g. ENS domains and profiles):

```bash
# Generate migration files (if schema changes)
pnpm drizzle:generate

# Run migrations
pnpm drizzle:migrate
```

## Running the Indexer

### Development Mode

For local development with hot-reloading:

```bash
pnpm dev
```

This will:

- Start the Ponder indexer
- Start the API server
- Set up file watching for changes

### Production Mode

For production deployment:

```bash
# Start the indexer
pnpm start

# Start the API
pnpm serve
```

### Using PM2 (Production)

For production deployments, you can use the included PM2 configuration:

```bash
pm2 start ecosystem.config.cjs
```

## Indexer Health Checks

The indexer exposes health endpoints:

- `GET /health` - Basic health check
- `GET /status` - Sync status check
