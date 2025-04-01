# Using the Indexer API

The Mint indexer provides two APIs for accessing indexed data:

1. A **GraphQL API** for flexible queries of indexed blockchain data
2. A **Profiles REST API** for user profile management

## GraphQL API

The GraphQL API is available at the root domain of your indexer deployment:

- Development: `http://localhost:42069`
- Production: Depends on your deployment configuration.
  You can use [indexer.networked.art](https://indexer.networked.art) as an example deployment.

### Basic Queries

Here are some example GraphQL queries:

#### Query Collections

```graphql
query Collections {
  collections(limit: 10) {
    items {
      address
      name
      artist {
        address
      }
      artifacts {
        totalCount
      }
    }
  }
}
```

#### Query Collected Artifacts

```graphql
query MyArtifacts {
  ownerships(where: { account: "0xe11da9560b51f8918295edc5ab9c0a90e9ada20b" }) {
    totalCount
    items {
      balance
      artifact {
        id
        name
        description
        collection {
          name
          address
        }
      }
    }
  }
}
```

### Using with JavaScript

Here's how to query the GraphQL API from JavaScript:

```js
// Using fetch
const response = await fetch('https://indexer.networked.art', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: `
      query Collections {
        collections(limit: 10) {
          items {
            address
            name
            artist {
              address
            }
            artifacts {
              totalCount
            }
          }
        }
      }
    `,
  }),
})

const { data } = await response.json()
```

## Profiles API

The Profiles API is a REST endpoint specifically for user profile management.

### Base URL

- Endpoint: `/profiles/:id`
- Where `:id` can be an Ethereum address or ENS domain

### Getting a Profile

```js
// Get profile by Ethereum address
const profile = await fetch('/profiles/0x1234...').then((r) => r.json())

// Get profile by ENS name
const profile = await fetch('/profiles/artist.eth').then((r) => r.json())
```

Profile responses include:

```json
{
  "address": "0x1234...",
  "ensName": "artist.eth",
  "displayName": "Amazing Artist",
  "avatarUri": "ipfs://...",
  "bio": "Creating digital art on Ethereum",
  "links": {
    "website": "https://artist.com",
    "twitter": "artist",
    "discord": "artist#1234"
  }
}
```

