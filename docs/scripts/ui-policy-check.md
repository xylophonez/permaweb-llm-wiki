# `ui-policy-check.mjs`

Purpose: report whether tracked UI source matches recorded release evidence, with a separate strict gate for an explicitly authorized release.

## Commands

```bash
npm run policy:ui-check
```

Predeploy mode:

```bash
npm run policy:ui-check:predeploy
```

Authorized release gate:

```bash
npm run policy:ui-check:release
```

## Behavior

The default and predeploy checks:

1. Loads tracked UI source rules from [`data/ui-policy.json`](../../data/ui-policy.json).
2. Computes a deterministic fingerprint for tracked files.
3. Reports missing, invalid, or stale deploy evidence without publishing or blocking local work.
4. Makes no wallet request and performs no network write.

The release check performs the same inspection and fails unless:

- tracked UI files exist
- `data/last-ui-release.json` is valid and complete
- the recorded source hash matches the current tracked source

Run the release check only after the user has authorized publication and the deploy has returned successful evidence. It validates a release record; it does not authorize, sign, submit, or retry a deployment.
