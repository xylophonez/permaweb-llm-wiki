# Deploying web apps

Permaweb applications can use plain static files or a frontend toolchain such as Vite. The release boundary is the built static directory, not the framework.

## Static output requirements

A deployable build should have:

- a complete static output directory such as `dist/`
- an `index.html` entry point
- asset paths that work through the intended gateway, path, name, or reference
- no hidden dependency on an application server
- an Arweave path manifest that describes the uploaded files
- a fallback entry when the application needs SPA or not-found routing

Use manifest version `0.2.0`. See [../../resources/arweave/manifest.example.json](../../resources/arweave/manifest.example.json).

## Arweave-first storage baseline

- publish application release artifacts to Arweave
- publish durable user-authored data to Arweave when the product promises permanent storage
- use local or browser storage for drafts, caches, preferences, and other explicitly non-canonical state

Do not imply that every application must publish a source archive, lineage tag, mutable name, or AO process. Add those only when the application has a concrete requirement for them.

## Build patterns

### Plain static HTML, CSS, and JavaScript

Use direct source files and a small build step when the application is mostly static, direct editability matters, or minimal tooling is valuable.

### Vite static output

Use Vite for React, TypeScript, or a richer toolchain, while keeping output static:

- set `base: './'` when the app must resolve assets from varying gateway paths
- build into `dist/`
- avoid assuming the app is always served from `/`
- verify lazy chunks, workers, icons, and manifest files after bundling

See [../../resources/arweave/web-app-build-patterns.md](../../resources/arweave/web-app-build-patterns.md) for the distilled build guidance.

## Primary deployment tool

Use [`@permaweb/deploy`](permaweb-deploy.md) for folder uploads, Arweave manifest creation, optional Permaweb Name or reference updates, deduplication, and legacy or HyperBEAM uploader selection.

The package is installed as `@permaweb/deploy`; its command remains `permaweb-deploy`. Version `7.0.0` was checked on 2026-09-02. Pin the reviewed version in the application that owns the release workflow, and check upstream before upgrading.

The custom [deploy-up.mjs](../../resources/arweave/deploy-up.mjs) example is useful for understanding low-level ANS-104 asset and manifest uploads. It is not the default site deployment CLI.

## Release order

After the user explicitly authorizes publication:

1. build and verify the exact static output
2. confirm the immutable upload and any separate name or reference update
3. record the source fingerprint, uploader, and selected signer
4. request signing only after the release payload is ready
5. upload the static folder and create its manifest
6. preserve the returned asset and manifest IDs
7. update a Permaweb Name or reference only when that additional write was authorized
8. record release evidence
9. verify the release-specific completion conditions

Build and preview do not authorize signing or publication. Use [../permaweb/release-policy.md](../permaweb/release-policy.md) for the authorization boundary and [../permaweb/write-lifecycle.md](../permaweb/write-lifecycle.md) for accurate status reporting.

## Signer selection

For `@permaweb/deploy`, prefer an explicit `--wallet` path during a local operator flow or `DEPLOY_KEY` from a protected CI secret. Avoid inline `--private-key` values because shell history and process inspection can expose them.

At version `7.0.0`, Permaweb Name and legacy-reference updates require an Arweave signer. Upload-only flows support the additional signer types listed by the CLI.

Do not search for unrelated keys or generate a replacement signer. AO configuration files are not deploy keys. Never print, upload, archive, or store private key material in release evidence.

For browser dApps, use [wallet-operations.md](wallet-operations.md): request minimal permissions through `window.arweaveWallet`, and keep transaction construction and status checks behind an application-owned adapter.

## Verification

Record the immutable manifest ID even when the release also changes a name or reference. Verify the effects separately:

- the upload route accepted the release
- the designated gateway serves the manifest
- important assets and deep links load through the intended URL shape
- the optional name or reference resolves to the new manifest
- service-worker and application caches do not hide the new release

Do not replay an ambiguous upload through another uploader. Preserve returned IDs and reconcile the existing attempt first.

## Evidence

- [Permaweb Deploy](permaweb-deploy.md)
- [Official Permaweb Deploy repository](https://github.com/permaweb/permaweb-deploy)
- [up.arweave.net](up-arweave.md)
- [Low-level upload example](../../resources/arweave/deploy-up.mjs)
