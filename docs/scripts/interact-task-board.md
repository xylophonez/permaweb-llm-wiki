# `interact-task-board.mjs`

Purpose: run the full task-board interaction surface against an existing process and verify that all handlers behave correctly.

## Command

```bash
npm run interact:task-board -- --process <PROCESS_ID>
```

Direct form:

```bash
node ./scripts/interact-task-board.mjs \
  --process <PROCESS_ID> \
  --title "Write docs" \
  --description "Document all task board scripts" \
  --priority high \
  --assignee <WALLET_ADDRESS>
```

## What it does

The script talks to an existing task board process and runs:

1. `Info`
2. `Board-Stats` if already configured
3. `Init` if the process is not configured yet
4. `Create-Task`
5. `Assign-Task`
6. `Start-Task`
7. `Complete-Task`
8. `Reopen-Task`
9. `Get-Task`
10. `List-Tasks`
11. `Board-Stats`
12. `Info`

It validates that:

- each action returns the expected action tag
- the created task is visible through `Get-Task` and `List-Tasks`
- task count increases by exactly one
- board stats change as expected

## CLI options

- `--process <PROCESS_ID>`: required
- `--out <PATH>`: log output path
- `--name <NAME>`: process name to use only if `Init` is needed
- `--assignee <ADDRESS>`: assignee for the created task
- `--title <TEXT>`: task title
- `--description <TEXT>`: task description
- `--priority <low|medium|high|urgent>`: task priority

## Environment variables

- `AO_URL`: preferred write endpoint
- `AO_FALLBACK_URLS`: candidates used only during read-only preflight selection
- `AO_SCHEDULER`
- `AO_WALLET_PATH` or `ARWEAVE_JWK`
- `AO_PROCESS_NAME`
- `AO_TASK_ASSIGNEE`
- `AO_TASK_TITLE`
- `AO_TASK_DESCRIPTION`
- `AO_TASK_PRIORITY`

CLI flags take precedence over env vars.

## Output

Stdout prints a small JSON summary:

```json
{
  "status": "ok",
  "selectedUrl": "https://push-1.forward.computer",
  "processId": "<PROCESS_ID>",
  "attempts": 1,
  "taskId": "2",
  "logPath": "/abs/path/to/log.json"
}
```

Default log path:

```text
./runs/interactions/task-board-<timestamp>.json
```

The log includes:

- message IDs for every interaction
- whether initialization happened during the run
- before/after task counts
- before/after board stats

## Example

```bash
npm run interact:task-board -- \
  --process BarutlHJmCSZGzkTyhCazsd-LyFHrsm8gry69XJ55N4 \
  --title "Audit handlers" \
  --description "Verify all task board actions" \
  --priority urgent
```

## Notes

- This script mutates process state by creating a task.
- Use it for protocol verification, demos, or smoke testing after deployment.
- It selects one route before the interaction and does not replay signed actions across endpoints.
- If failure occurs after possible submission, treat the outcome as unknown until process state is reconciled.
