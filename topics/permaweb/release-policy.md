# Permaweb build and release policy

Use this policy for static Permaweb applications regardless of frontend framework, wallet provider, uploader, or naming system.

## Local iteration

For ordinary application changes:

1. apply the change
2. run the relevant tests, checks, and build
3. preview locally when useful
4. report what is validated locally and what remains unverified

Do not connect a wallet, request a signature, create a signer, or publish as an automatic consequence of changing source code.

## Authorized release

Treat uploads, deploys, name changes, and reference updates as permanent or externally visible writes. Start them only after the user explicitly requests or authorizes the intended effects.

For an authorized release:

1. identify the immutable upload and any mutable name or reference update separately
2. build and verify the exact static output
3. record the source fingerprint and selected release target
4. use a signer already selected by the user or project
5. request signing only after the exact payload is ready
6. submit once to the selected write route
7. preserve returned transaction, data-item, manifest, name, and reference IDs as applicable
8. record release evidence tied to the source fingerprint
9. verify each operation-specific completion condition

A missing signer is a blocker. Do not generate, import, replace, export, or print wallet key material merely to unblock release. Prefer a connected browser wallet when the application supports one. For script-driven publication, require an explicit wallet path, protected secret, or already selected project signer.

Use [write-lifecycle.md](write-lifecycle.md) to distinguish signed, submitted, accepted, confirmed, indexed, available, and complete states. A returned ID is evidence of submission or acceptance, not proof that the release is already available through every gateway.

## Release evidence

Keep evidence machine-readable, but let each application define its own UI receipt or response format. A generic static release record should contain:

- `timestamp`
- `appUrl`
- `manifestId`
- `sourceHash`

Add fields only when the release actually used them, for example:

- `name`
- `referenceId`
- `uploader`
- `transactionIds`
- `title`
- `description`
- `sourceFileCount`
- `trackedRoots`

Do not require a source archive, lineage tag, name update, or application-card protocol for every Permaweb app. Those are optional project-level decisions.

## Local enforcement scripts

- `npm run policy:ui-check`
  - reports whether tracked UI source matches `data/last-ui-release.json`
  - performs no wallet or network action
- `npm run policy:ui-check:predeploy`
  - compatibility alias for the advisory check during release preparation
- `npm run policy:ui-check:release`
  - strict post-deploy gate for an explicitly authorized release
  - fails if tracked source and valid release evidence do not match
- `npm run release:record-ui -- --summary=<deploy-summary.json> --title=<title> --description=<note>`
  - writes `data/last-ui-release.json`
  - requires the deploy summary to contain canonical `appUrl` and `manifestId` fields

Tracked sources are configured by [../../data/ui-policy.json](../../data/ui-policy.json).

The default check allows local iteration when source roots or release evidence are absent. The strict release check requires both because it validates a claimed release; it does not authorize or perform one.

## Related guidance

- [Deploying web apps](../arweave/deploying-web-apps.md)
- [Permaweb Deploy](../arweave/permaweb-deploy.md)
- [Wallet operations](../arweave/wallet-operations.md)
