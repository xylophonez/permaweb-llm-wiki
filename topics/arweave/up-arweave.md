# up.arweave.net

`up.arweave.net` is the default legacy ANS-104 uploader used by `@permaweb/deploy`. It is one write route, not the only application deployment path.

## Strong local references

- [permaweb-deploy.md](permaweb-deploy.md)
- [resources/arweave/deploy-up.mjs](../../resources/arweave/deploy-up.mjs)
- [resources/arweave/manifest.example.json](../../resources/arweave/manifest.example.json)
- [codebases/permaweb-libs/sdk/src/common/arweave.ts](../../codebases/permaweb-libs/sdk/src/common/arweave.ts)
- [wallet-operations.md](wallet-operations.md)

## Role in deployment flows

The repo-scoped low-level example sends signed data items to `up.arweave.net` for:

- static assets
- the Arweave path manifest

The supporting SDK shows the broader separation of concerns:

- gateways and indexes handle reads and discovery
- a selected uploader handles writes
- larger uploads use chunked data-item flows rather than plain gateway transactions

## When to use it

Use the legacy route when:

- the release plan calls for the default `@permaweb/deploy` uploader
- compatibility with a legacy ANS-104 upload flow matters
- a low-level integration needs item-by-item asset or manifest control

For a normal static app release, start with [`@permaweb/deploy`](permaweb-deploy.md). Use [resources/arweave/deploy-up.mjs](../../resources/arweave/deploy-up.mjs) only when low-level data-item control is needed.

For HyperBEAM uploads, choose `--uploader-type hyperbeam` and pin `--uploader` when the exact write destination must be recorded.

If a browser dApp must upload through `up.arweave.net` programmatically, keep signing behind the wallet adapter and send the resulting data item once. Do not automatically retry an ambiguous signed upload.

## Related page

- [deploying-web-apps.md](deploying-web-apps.md)
