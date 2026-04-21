# `ui-policy-check.mjs`

Purpose: enforce the UI deploy policy by verifying tracked UI source hash against `data/last-ui-deploy.json`.

## Commands

```bash
npm run policy:ui-check
```

Predeploy mode:

```bash
npm run policy:ui-check:predeploy
```

## Behavior

The script:

1. Loads tracked UI source rules from [`data/ui-policy.json`](../../data/ui-policy.json).
2. Computes a deterministic fingerprint for tracked files.
3. Validates `data/last-ui-deploy.json` shape and required fields.
4. Fails when no tracked UI files are found from configured source roots.
5. Fails when tracked UI source changed after the last recorded deploy evidence.

## Environment variables

- `ALLOW_UNDEPLOYED_UI=1`: allow missing/stale evidence during deploy-in-progress flows.
- `ALLOW_NO_UI_ROOTS=1`: allow zero matched UI source roots for intentional non-UI runs.
