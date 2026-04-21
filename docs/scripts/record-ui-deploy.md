# `record-ui-deploy.mjs`

Purpose: store deploy evidence for the current UI source state and emit the canonical `PERMAWEB_APP` card line.

## Command

```bash
npm run deploy:record-ui -- --summary ./runs/deploy-summary.json --title "App Name" --description "What changed"
```

## Summary input shape

The `--summary` JSON must provide these canonical fields:

- `appUrl`
- `manifestId`
- `archiveUrl`
- `archiveId`

The script writes:

- `data/last-ui-deploy.json`

and prints:

- one canonical `PERMAWEB_APP {...}` line for UI-card parsing.
