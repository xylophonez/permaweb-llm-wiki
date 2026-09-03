# `record-ui-release.mjs`

Purpose: store evidence that a specific UI source state produced an authorized static release.

## Command

```bash
npm run release:record-ui -- --summary ./runs/deploy-summary.json --title "App Name" --description "What changed"
```

## Summary input shape

The `--summary` JSON must provide:

- `appUrl`
- `manifestId`

It may also provide `name`, `referenceId`, `uploader`, `transactionIds`, `title`, or `description` when those fields apply to the release.

The script writes `data/last-ui-release.json` with the current source fingerprint. It does not define an application-specific UI receipt, connect a wallet, or perform a network write.
