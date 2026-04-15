# GraphQL

GraphQL is the default discovery and retrieval layer for many simpler Permaweb app behaviors.

## Default stance

Prefer GraphQL when the application view can be reconstructed from immutable records and the main problem is retrieval, filtering, or latest-artifact lookup. Ownership and permissions can be simulated by filtering by uploader address.

## Good fits for GraphQL

- latest manifest lookup
- discovery by owner and tags
- content feeds
- filtered views over immutable data
- many read-heavy app behaviors

## Concrete local example

- [resources/arweave/graphql-reference.md](../../resources/arweave/graphql-reference.md), which is the maintained reference for the local GraphQL helper contract
- [codebases/permaweb-libs/sdk/src/common/gql.ts](../../codebases/permaweb-libs/sdk/src/common/gql.ts), which builds tag, owner, id, recipient, block, sort, and cursor-based queries
- [codebases/permaweb-libs/sdk/src/helpers/types.ts](../../codebases/permaweb-libs/sdk/src/helpers/types.ts), which defines the local query argument shapes
- [resources/arweave/graphql-snippets.md](../../resources/arweave/graphql-snippets.md), which captures the repo-scoped query shapes that matter for app discovery

That pattern matters because it shows GraphQL doing the discovery work that does not need AO.

## Practical distinction

Use GraphQL when:

- the app can reconstruct its view from immutable records
- the hard part is finding the right records
- filters, tags, owner, and sort order are the main problem

Move toward AO when:

- the hard part is no longer retrieval
- the hard part is coordinated state transitions or token logic

## Open note

The current local snippets cover:

- latest manifest lookup
- child fork discovery by `forked-from`
- code archive lookup for a published app

The current local reference page covers the helper-level "spec":

- supported inputs
- supported filters
- gateway differences
- returned fields
- sort and pagination behavior

The repo still lacks a larger end-to-end app example that exercises these queries against a real release history.

## Evidence

- [../ao/when-to-use-ao.md](../ao/when-to-use-ao.md)
- [../../resources/arweave/deploy-up.mjs](../../resources/arweave/deploy-up.mjs)
