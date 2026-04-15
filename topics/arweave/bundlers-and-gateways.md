# Bundlers And Gateways

Gateways and upload services solve different problems and should not be collapsed into one mental model.

## Default distinction

Use gateways for reads and discovery:

- fetching published app files
- GraphQL lookups
- resolving manifests and tagged artifacts

Use bundlers or upload services for writes:

- publishing data items
- chunking larger uploads
- attaching provenance tags at upload time

## Strong local evidence

- [codebases/permaweb-libs/sdk/src/helpers/config.ts](../../codebases/permaweb-libs/sdk/src/helpers/config.ts): current defaults for read gateways and upload targets
- [codebases/permaweb-libs/sdk/src/common/arweave.ts](../../codebases/permaweb-libs/sdk/src/common/arweave.ts): concrete chunked upload flow
- [resources/arweave/deploy-up.mjs](../../resources/arweave/deploy-up.mjs): repo-scoped static app publish example
- [wallet-operations.md](wallet-operations.md): browser wallet signing and dispatch guidance

## What the SDK code shows

The local `permaweb-libs` SDK keeps these concerns separate:

- `GATEWAYS.arweave` defaults to `arweave.net`
- `GATEWAYS.ao` defaults to `ao-search-gateway.goldsky.com`
- `UPLOAD.node1` points at a dedicated write service
- small payloads can be dispatched directly
- larger payloads use chunked uploads with explicit finalization

That is the useful durable rule: read paths and write paths are different subsystems.

## Use this for that

- Use a gateway when the task is search, GraphQL lookup, manifest resolution, or content fetch.
- Use an upload service when the task is publishing a new app, asset set, or code archive.
- Use both when the workflow is "publish, then verify discovery."
- Use `window.arweaveWallet` + `arweave-js` together when the workflow is browser dApp publish with user-controlled signing.

## Open question

This repo still lacks a richer local comparison page covering gateway caching behavior, HyperBEAM paths, and copycat patterns. The current page is intentionally limited to the write-vs-read distinction that is directly supported by local code.
