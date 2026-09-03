# `get-task-board-state.mjs`

Purpose: read the current task board state, print it as formatted JSON, and save a structured run log.

## Command

```bash
npm run state:task-board -- --process <PROCESS_ID>
```

Direct form:

```bash
node ./scripts/get-task-board-state.mjs \
  --process <PROCESS_ID> \
  --out ./runs/state/my-board-state.json
```

## What it does

The script prefers a single `Get-State` read when the deployed process supports it.

If that handler is not available, it falls back to reconstructing state from:

1. `Info`
2. `Board-Stats`
3. `List-Tasks`

That means it works with:

- newly deployed task boards that include `Get-State`
- older task boards that only expose the original read handlers

## CLI options

- `--process <PROCESS_ID>`: required
- `--out <PATH>`: run log output path

## Environment variables

- `AO_URL`: preferred endpoint
- `AO_FALLBACK_URLS`: candidates used only during read-only preflight selection
- `AO_SCHEDULER`
- `AO_WALLET_PATH` or `ARWEAVE_JWK`

## Output

On success, stdout prints the board state JSON:

```json
{
  "Name": "ao-task-board-lab",
  "Owner": "<OWNER_ADDRESS>",
  "Configured": true,
  "NextTaskId": 3,
  "UpdatedAt": "<TIMESTAMP>",
  "Stats": {
    "Total": 2,
    "Open": 2,
    "InProgress": 0,
    "Done": 0
  },
  "Tasks": []
}
```

The actual `Tasks` array contains every task in the board.

Default run log path:

```text
./runs/state/task-board-state-<timestamp>.json
```

The run log includes:

- endpoint probe results
- whether fallback logic was used
- message IDs for the read actions
- the exact state object that was printed

## Example

```bash
npm run state:task-board -- --process BarutlHJmCSZGzkTyhCazsd-LyFHrsm8gry69XJ55N4
```

## Notes

- This is a read-only script.
- It still requires a wallet because it uses AO message/result flows.
- Those signed messages are not replayed across endpoints. Prefer a signer-free read API in new browser clients when the deployed protocol exposes one.
