# Token blueprints

This wiki maintains one recommended AO token flow.

## Recommended local flow

Use these files together:

- [ao/token.lua](../../ao/token.lua): canonical local token blueprint for this wiki
- [scripts/deploy-token.mjs](../../scripts/deploy-token.mjs): deploy + interaction-proof harness
- [docs/scripts/deploy-token.md](../../docs/scripts/deploy-token.md): operator command and runtime notes

## Deployment and proof sequence

The required sequence is:

1. `spawn` a new process with configured scheduler/module/authority
2. `Eval` the Lua blueprint
3. `Info`
4. `Balance` (before)
5. `Claim`
6. `Balance` (after)

A run is valid only when:

- a new process ID is returned
- `afterBalance - beforeBalance` matches `10^Denomination`

## Runtime hardening notes

- Always send `Balance` checks with an explicit recipient tag tied to the deployment wallet address (`Recipient=<derived wallet address>`), instead of relying on implicit sender defaults.
- Probe candidate routes with idempotent requests, then choose one write route before spawning or sending messages.
- Do not replay `ao.message(...)` automatically after a transport error. A timeout may mean the action was accepted even though the response was lost.
- Preserve returned IDs and reconcile process state before starting another authorized attempt.

## Versioned harness values

The local deploy harness currently contains:

- `AO_SCHEDULER`: `n_XZJhUnmldNFo4dhajoPZWhBXuJk-OcQr5JQ49c4Zo`
- `AO_MODULE`: `ISShJH1ij-hPPt9St5UFFr_8Ys3Kj5cyg7zrMGt7H9s`
- AO URL priority:
  - `https://push-1.forward.computer`
  - `https://push-2.forward.computer`

Treat these as versioned example values, not universal AO defaults. Validate them against the selected protocol and environment before use.

## Use this for that

- Use `ao/token.lua` when a process needs direct token actions (`Info`, `Balance`, `Transfer`, `Claim`, `Mint`).
- Use `scripts/deploy-token.mjs` when a deployment needs machine-checkable interaction proof, not only a spawn ID.
- Use `codebases/mux/` and `codebases/permaweb-libs/` only as secondary integration references after this flow is established.

## Evidence

- [scripts/deploy-token.mjs](../../scripts/deploy-token.mjs)
- [docs/scripts/deploy-token.md](../../docs/scripts/deploy-token.md)
- [WORKING-PATTERNS.md](../../WORKING-PATTERNS.md)
