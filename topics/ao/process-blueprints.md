# AO Process Blueprints

This repo keeps a small local AO example corpus that is easier for agents to learn from than a giant cookbook dump.

## Primary local blueprints

- [ao/counter.lua](../../ao/counter.lua): smallest deterministic owner-initialized process in this repo.
- [ao/task-board.lua](../../ao/task-board.lua): richer example with owner-gated writes, structured reads, and full-state reconstruction.
- [ao/token.lua](../../ao/token.lua): token process blueprint used by the maintained token flow.

## Primary local harnesses

- [scripts/deploy-counter.mjs](../../scripts/deploy-counter.mjs): full lifecycle deploy harness with failover and semantic assertions.
- [scripts/test-counter-lifecycle.mjs](../../scripts/test-counter-lifecycle.mjs): live integration test runner for default and forced-failover routes.
- [scripts/deploy-task-board.mjs](../../scripts/deploy-task-board.mjs): full task-board deploy and validation flow.
- [scripts/interact-task-board.mjs](../../scripts/interact-task-board.mjs): interaction runner for an existing deployed board.
- [scripts/get-task-board-state.mjs](../../scripts/get-task-board-state.mjs): deterministic state reader with fallback reconstruction.
- [scripts/deploy-token.mjs](../../scripts/deploy-token.mjs): token deploy + interaction-proof flow.
- [docs/scripts/](../../docs/scripts/): operator-facing notes for each harness.

## Selection rule

Use the small local corpus first:

- obvious source files
- deploy scripts
- interaction scripts
- recent run artifacts

Prefer these over large generic AO documentation dumps when building repo-local guidance or agent context.

## Repeatedly working patterns

The strongest reusable guidance currently captured in [WORKING-PATTERNS.md](../../WORKING-PATTERNS.md) is:

- make state idempotent at top level with `Var = Var or <default>`
- expose a single reply helper that supports both `msg.reply(...)` and `Send(...)`
- read tags defensively from `Tags`, `TagArray`, or direct fields
- make setup one-way: `Init` once, then owner-gated writes after configuration
- return explicit action tags on every handler
- prove deploy success with semantic assertions, not just message IDs
- probe AO endpoints before deploy and fail over automatically

## Reliable defaults

The current local harness defaults are:

- `AO_SCHEDULER`: `n_XZJhUnmldNFo4dhajoPZWhBXuJk-OcQr5JQ49c4Zo`
- `AO_MODULE`: `ISShJH1ij-hPPt9St5UFFr_8Ys3Kj5cyg7zrMGt7H9s`
- AO URL priority:
  - `https://push-1.forward.computer`
  - `https://push-2.forward.computer`

## Use this for that

- Use `ao/counter.lua` when the need is the smallest owner-gated mutable process.
- Use `ao/task-board.lua` when the need is a fuller action surface with public reads and state summaries.
- Use `ao/token.lua` when the need is a token action surface with deploy-time interaction proof.
- Use the deploy scripts when the task needs live-network validation and structured run logs, not just blueprint authoring.

## Evidence
- [WORKING-PATTERNS.md](../../WORKING-PATTERNS.md)
- [docs/scripts/deploy-task-board.md](../../docs/scripts/deploy-task-board.md)
- [docs/scripts/interact-task-board.md](../../docs/scripts/interact-task-board.md)
- [docs/scripts/get-task-board-state.md](../../docs/scripts/get-task-board-state.md)
- [docs/scripts/deploy-token.md](../../docs/scripts/deploy-token.md)
