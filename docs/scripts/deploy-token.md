# `deploy-token.mjs`

Purpose: spawn a new AO token process, evaluate [`ao/token.lua`](../../ao/token.lua), and prove live interaction with deterministic balance checks.

## Command

```bash
npm run deploy:token
```

Direct form:

```bash
node ./scripts/deploy-token.mjs --out ./runs/my-token-run.json
```

## What it does

The script:

1. Resolves AO endpoints from `AO_URL` and `AO_FALLBACK_URLS`.
2. Probes endpoints before deployment.
3. Spawns a new process with the configured AO module and scheduler.
4. Sends `Eval` with `ao/token.lua`.
5. Sends `Info`.
6. Sends `Balance` with `Recipient=<derived wallet address>` (before claim).
7. Sends `Claim`.
8. Sends `Balance` again with `Recipient=<derived wallet address>` (after claim).
9. Asserts that `postBalance - preBalance == 10^Denomination`.
10. Persists a structured JSON run log.

Success means semantic checks passed, not only transport success.

## CLI options

- `--out <PATH>`: log output path

## Environment variables

- `AO_URL`: primary endpoint to try first
- `AO_FALLBACK_URLS`: comma-separated fallback endpoints
- `AO_SCHEDULER`
- `AO_MODULE`
- `AO_AUTHORITY`
- `AO_WALLET_PATH` or `ARWEAVE_JWK`

## Output

Stdout prints a compact summary:

```json
{
  "status": "ok",
  "selectedUrl": "https://push-1.forward.computer",
  "processId": "<PROCESS_ID>",
  "walletAddress": "<WALLET_ADDRESS>",
  "attempts": 1,
  "logPath": "/abs/path/to/log.json"
}
```

Default log path:

```text
./runs/token-latest.json
```

The log includes:

- endpoint probe results
- per-attempt telemetry
- message IDs for `Eval`, `Info`, `Balance`, and `Claim`
- proof fields: `beforeBalance`, `afterBalance`, `observedDelta`, `expectedDelta`

## Notes

- This script creates a new process on each successful run.
- It requires a wallet key that can sign AO messages.
- If the first endpoint fails, the script retries on the next configured endpoint.
- For transient AO transport send failures, the script retries `ao.message(...)` once before failing the current endpoint attempt.
