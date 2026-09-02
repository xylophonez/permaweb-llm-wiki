# Permaweb Deploy

Use `@permaweb/deploy` as the primary CLI for static Permaweb application uploads and optional Permaweb Name or reference updates.

The npm package was renamed from `permaweb-deploy` to `@permaweb/deploy`. The command remains `permaweb-deploy`.

Version checked on 2026-09-02: `7.0.0`.

Primary source: [permaweb/permaweb-deploy](https://github.com/permaweb/permaweb-deploy)

## Install it in the app

Pin the reviewed version in the application that owns the release workflow:

```bash
npm install --save-dev @permaweb/deploy@7.0.0
```

Do not add the deploy package to a documentation-only workspace that has no static build output. Check the current package version and changelog before changing the pin.

## Upload an immutable app

After building and verifying `dist/`, an explicitly authorized upload can run:

```bash
npx permaweb-deploy upload \
  --deploy-folder ./dist \
  --wallet ./wallet.json
```

This uploads the folder and creates an Arweave path manifest. The returned manifest ID identifies the immutable release.

The command is a permanent write. Confirm the source fingerprint, upload target, cost boundary, and selected signer before running it. Do not generate a wallet to satisfy the command.

## Update a Permaweb Name or reference

Uploading content and changing a mutable pointer are separate release effects. Use `deploy --use-names` only when the user authorized both.

Update a name:

```bash
npx permaweb-deploy deploy \
  --use-names \
  --name my-app \
  --deploy-folder ./dist \
  --wallet ./wallet.json
```

Update a direct reference:

```bash
npx permaweb-deploy deploy \
  --use-names \
  --reference-id REFERENCE_ID \
  --deploy-folder ./dist \
  --wallet ./wallet.json
```

At the checked version, name and legacy-reference updates require an Arweave signer. An upload-only flow can also use the other signer types supported by the CLI.

Record the immutable manifest ID before attempting a name or reference update. If the pointer update fails, the immutable upload may still be valid and recoverable.

## Choose the uploader before signing

The default uploader is the legacy ANS-104 route at `https://up.arweave.net`.

```bash
npx permaweb-deploy upload \
  --deploy-folder ./dist \
  --wallet ./wallet.json \
  --uploader https://up.arweave.net
```

For a HyperBEAM upload:

```bash
npx permaweb-deploy upload \
  --deploy-folder ./dist \
  --wallet ./wallet.json \
  --uploader-type hyperbeam \
  --uploader https://selected-hyperbeam.example
```

If `--uploader` is omitted in HyperBEAM mode, the CLI discovers an active uploader. Pin the uploader for production releases when the exact write destination must be recorded and reproduced.

Do not replay an ambiguous upload against another uploader. Preserve returned IDs and reconcile the existing attempt under the [write lifecycle](../permaweb/write-lifecycle.md).

## Manifests and deduplication

Folder deployments create Arweave path manifests using version `0.2.0` and can detect an SPA fallback.

The CLI stores deduplication state in `.permaweb-deploy/transaction-cache.json`. Reused asset IDs are an optimization, not proof that the new manifest or name update completed. Keep manifest verification and gateway availability checks in the release flow.

## GitHub Actions

The repository provides `permaweb/permaweb-deploy@v1`. Prefer a manually dispatched workflow or a protected GitHub environment unless the project has explicitly chosen push-to-main as release authorization.

```yaml
name: Release to the permaweb

on:
  workflow_dispatch:

jobs:
  release:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: npm ci
      - run: npm run build
      - uses: permaweb/permaweb-deploy@v1
        with:
          deploy-key: ${{ secrets.DEPLOY_KEY }}
          deploy-folder: ./dist
```

Keep wallet material in GitHub secrets. Do not print it or expose it through a client-prefixed build variable.

## Optional project metadata

The CLI owns the static folder, manifest, uploader, deduplication, and optional name or reference update. Source archives, provenance metadata, application-specific tags, and UI receipts are separate project decisions.

If a project adds those artifacts, document and verify them in that project's release workflow. Do not present them as requirements of `@permaweb/deploy` or of Permaweb applications generally.

## Release states

- CLI return with a manifest ID: `accepted`
- required transaction confirmation observed: `confirmed`
- manifest returned by the designated gateway: `available`
- authorized name or reference resolves to the new manifest: pointer update verified
- every release-specific condition observed: `complete`

See [Deploying web apps](deploying-web-apps.md) for the full release order and [Permaweb write lifecycle](../permaweb/write-lifecycle.md) for failure handling.
