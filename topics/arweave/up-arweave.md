# up.arweave.net

`up.arweave.net` is the cleanest repo-scoped target here when the task is "publish a static app as data items with manifest and provenance tags."

## Strong local references

- [resources/arweave/deploy-up.mjs](../../resources/arweave/deploy-up.mjs)
- [resources/arweave/manifest.example.json](../../resources/arweave/manifest.example.json)
- [codebases/permaweb-libs/sdk/src/common/arweave.ts](../../codebases/permaweb-libs/sdk/src/common/arweave.ts)
- [wallet-operations.md](wallet-operations.md)

## Default role in local deploy flows

The repo-scoped deploy example uses `up.arweave.net` to upload:

- gzip code archives
- static assets
- manifests

The supporting SDK code in `permaweb-libs` shows the same broader separation of concerns even when it targets a different write endpoint:

- read and discovery use gateways such as `arweave.net` and `ao-search-gateway.goldsky.com`
- data writes use a dedicated upload service
- larger uploads use chunked data-item flows rather than plain gateway transactions

## Why use it

In the local deploy example, `up.arweave.net` is the cleanest route for:

- item-by-item asset upload
- tagged code archive upload
- manifest publication with provenance tags

It fits the PermawebOS model because the scripts can attach the exact tags needed for:

- code archive discovery
- asset linkage
- fork lineage

## Practical guidance

If the task is "publish a built static app with manifest and lineage tags", start from [resources/arweave/deploy-up.mjs](../../resources/arweave/deploy-up.mjs).

If the task is "understand the upload mechanics behind a write service", read [codebases/permaweb-libs/sdk/src/common/arweave.ts](../../codebases/permaweb-libs/sdk/src/common/arweave.ts) as well.

If the task is browser-side signing and dispatch to publish from user wallets, use [wallet-operations.md](wallet-operations.md) as the primary integration path.

If a browser dApp must force uploads to `up.arweave.net` programmatically, prefer `signDataItem()` + direct `fetch` upload instead of `dispatch()`.

## Related page

- [deploying-web-apps.md](deploying-web-apps.md)
