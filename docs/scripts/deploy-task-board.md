# `deploy-task-board.mjs`

Purpose: spawn a fresh AO task board process, evaluate the Lua blueprint, initialize it, run a full lifecycle, and write a structured run log.

## Command

```bash
npm run deploy:task-board
```

Direct form:

```bash
node ./scripts/deploy-task-board.mjs --name my-task-board --out ./runs/my-task-board.json
```

## What it does

The script:

1. Resolves AO endpoint candidates from `AO_URL` and `AO_FALLBACK_URLS`.
2. Probes candidates with `HEAD` and selects one reachable write route before deployment.
3. Spawns a new process with the configured AO module and scheduler.
4. Sends `Eval` with [`ao/task-board.lua`](../../ao/task-board.lua).
5. Sends `Init`.
6. Sends and validates:
   - `Create-Task`
   - `Assign-Task`
   - `Start-Task`
   - `Complete-Task`
   - `Reopen-Task`
   - `Get-Task`
   - `List-Tasks`
   - `Board-Stats`
   - `Info`
7. Persists a structured JSON log.

Success means semantic validation passed, not just transport success.

## CLI options

- `--name <NAME>`: override `AO_PROCESS_NAME`
- `--out <PATH>`: log output path

## Environment variables

- `AO_URL`: preferred write endpoint
- `AO_FALLBACK_URLS`: comma-separated candidates used only during read-only preflight selection
- `AO_SCHEDULER`
- `AO_MODULE`
- `AO_AUTHORITY`
- `AO_WALLET_PATH` or `ARWEAVE_JWK`
- `AO_PROCESS_NAME`
- `AO_TASK_ASSIGNEE`: optional default assignee used during validation

## Output

Stdout prints a small JSON summary:

```json
{
  "status": "ok",
  "selectedUrl": "https://push-1.forward.computer",
  "processId": "<PROCESS_ID>",
  "attempts": 1,
  "logPath": "/abs/path/to/log.json"
}
```

Default log path:

```text
./runs/task-board-latest.json
```

The log includes:

- endpoint probe results
- per-attempt telemetry
- message IDs
- validation fields such as `createTaskAction`, `boardStatsAction`, `finalStatus`

## Example

```bash
AO_URL=https://push-1.forward.computer \
AO_FALLBACK_URLS=https://push-2.forward.computer \
npm run deploy:task-board -- --name ao-task-board-demo
```

## Notes

- This script is for new deployments.
- It expects a wallet that can sign AO messages.
- The script does not replay a signed deployment on another endpoint after an attempt starts.
- If failure occurs after possible submission, treat the outcome as unknown and reconcile it before running the command again.
