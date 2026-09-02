# GraphQL Snippets

These snippets are the repo-scoped reference shapes for app discovery and release lookup.

## Latest manifest for an app name and owner

```graphql
query LatestManifest {
  transactions(
    owners: ["<OWNER_ADDRESS>"]
    tags: [
      { name: "App-Name", values: ["<APP_NAME>"] }
      { name: "Type", values: ["manifest"] }
    ]
    first: 1
    sort: HEIGHT_DESC
  ) {
    edges {
      node {
        id
        tags {
          name
          value
        }
      }
    }
  }
}
```

## Releases for an application tag

```graphql
query ApplicationReleases {
  transactions(
    tags: [
      { name: "App-Name", values: ["<APP_NAME>"] }
      { name: "Type", values: ["manifest"] }
    ]
    first: 100
    sort: HEIGHT_DESC
  ) {
    edges {
      node {
        id
        owner {
          address
        }
        tags {
          name
          value
        }
      }
    }
  }
}
```

Use these alongside [../../codebases/permaweb-libs/sdk/src/common/gql.ts](../../codebases/permaweb-libs/sdk/src/common/gql.ts) when translating between raw GraphQL and the local SDK helper shape.
