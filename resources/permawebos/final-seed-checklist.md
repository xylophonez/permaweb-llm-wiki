# Final Seed Checklist

Use this when turning a static app into a durable, forkable release for later agents.

## Required release artifacts

- built app output in `dist/`
- manifest that points at every published asset
- source archive uploaded before the manifest
- `AGENTS.md` or equivalent instructions included in the source archive
- deploy output that prints both the app URL and the code archive URL

## Required metadata

- `App-Name`
- `App-Version`
- `Type`
- `Code-Archive`
- `forked-from` when this is a descendant release

## Packaging rules

- archive the app root directly, not a wrapper directory
- exclude `wallet.json`
- exclude `node_modules`
- keep markdown instruction files and other agent-facing guidance

## Release checks

- the manifest resolves `index.html`
- the published app can be rebuilt from the source archive
- the public release links back to its code archive
- the code archive and manifest IDs are recorded in deploy evidence

## Related examples

- [../arweave/deploy-up.mjs](../arweave/deploy-up.mjs)
- [../arweave/manifest.example.json](../arweave/manifest.example.json)
