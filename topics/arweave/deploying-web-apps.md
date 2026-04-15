# Deploying Web Apps

This repo supports both plain static apps and Vite-built apps, as long as they end in a clean static `dist/` that can be published by manifest.

## Recommended web app architecture

The durable part of the pattern is the output shape, not the specific frontend stack:

- a built static app in `dist/`
- root-relative files that can be described by a manifest
- a source archive that preserves the app root for later agents
- deploy metadata that links the public app back to its source archive

## Two good local patterns

### Plain static HTML/CSS/JS

The lite-seed templates show a strong plain-static pattern:

- keep `index.html` and `styles.css` as direct source files
- bundle browser JS into `dist/` with a simple build step
- copy `public/` into `dist/`
- prefer file layouts that remain easy for agents to inspect and patch

Use this when:

- the app is mostly static
- direct editability matters
- you want the least possible build complexity

### Vite static output

The local Vite app shows that richer frontends also work well if they are configured as static output:

- set `base: './'`
- build into `dist/`
- avoid hard dependence on `/` absolute asset paths
- keep head assets relative
- add runtime base-path handling when nested gateway paths need to work reliably

Use this when:

- the app needs React, TypeScript, or a heavier toolchain
- you still want a final output that behaves like a static site after build

See [../../resources/arweave/web-app-build-patterns.md](../../resources/arweave/web-app-build-patterns.md) for the distilled guidance.

## Core deploy order

The strongest local deploy flow is:

1. build the app into `dist/`
2. create a gzip code archive of the app root
3. upload the code archive first
4. upload app assets
5. upload the manifest
6. print both the app URL and the code archive URL
7. record deploy evidence where the template supports it

## Strong local script examples

The strongest repo-scoped examples are:

- [resources/arweave/deploy-up.mjs](../../resources/arweave/deploy-up.mjs): generic example script for uploading a source archive, assets, and manifest in the right order
- [resources/arweave/manifest.example.json](../../resources/arweave/manifest.example.json): minimal manifest structure for the final app object
- [resources/arweave/web-app-build-patterns.md](../../resources/arweave/web-app-build-patterns.md): distilled guidance for plain-static and Vite-based apps
- [wallet-operations.md](wallet-operations.md): recommended browser wallet and `arweave-js` integration model
- [resources/permawebos/final-seed-checklist.md](../../resources/permawebos/final-seed-checklist.md): release checklist for code archive, instructions, provenance, and evidence
- [codebases/permaweb-libs/sdk/src/common/arweave.ts](../../codebases/permaweb-libs/sdk/src/common/arweave.ts): concrete upload mechanics for chunked data-item writes
- [codebases/permaweb-libs/sdk/src/helpers/config.ts](../../codebases/permaweb-libs/sdk/src/helpers/config.ts): current gateway and upload defaults in the supporting SDK

## Important conventions

### Code archive first

The app source archive is uploaded before the assets and manifest.

The local templates treat that archive as a first-class artifact, not an optional extra.

### Archive contents

The final-seed templates require:

- app root archived directly
- no wrapper directory
- exclude `wallet.json`
- exclude `node_modules`
- preserve markdown guidance files like `AGENTS.md`

Source:

- [resources/arweave/deploy-up.mjs](../../resources/arweave/deploy-up.mjs)
- [resources/permawebos/final-seed-checklist.md](../../resources/permawebos/final-seed-checklist.md)

### Critical tags

The local deploy scripts consistently care about:

- `Content-Type`
- `Type`
- `code`
- `Code-Archive`
- `forked-from`
- app name and version tags

The tags are what let downstream tooling reconstruct lineage and discover the code archive.

### Manifest output

Use [resources/arweave/manifest.example.json](../../resources/arweave/manifest.example.json) as the local reference shape.

## Wallet resolution pattern

The generic example script uses this wallet order:

1. explicit `--wallet=...`
2. `ARWEAVE_WALLET`
3. `wallet.json` in app root

For browser dApps, use [wallet-operations.md](wallet-operations.md): `window.arweaveWallet` for permissions/sign/dispatch, plus `arweave-js` for transaction construction and status checks.

## Why this matters for LLM-friendly apps

This deploy pattern is tightly connected to the PermawebOS seed idea:

- the app should be reproducible
- the code archive should be discoverable
- fork provenance should be explicit
- the deploy output should be machine-usable

That is what lets an agent move from "find app" to "rebuild and publish fork" without hidden state.

## Evidence

- [up-arweave.md](up-arweave.md)
- [../permawebos/seed-pattern.md](../permawebos/seed-pattern.md)
