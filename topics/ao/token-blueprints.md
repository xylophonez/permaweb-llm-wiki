# Token Blueprints

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

## Defaults

The local deploy harness defaults are:

- `AO_SCHEDULER`: `n_XZJhUnmldNFo4dhajoPZWhBXuJk-OcQr5JQ49c4Zo`
- `AO_MODULE`: `ISShJH1ij-hPPt9St5UFFr_8Ys3Kj5cyg7zrMGt7H9s`
- AO URL priority:
  - `https://push-1.forward.computer`
  - `https://push-2.forward.computer`

## Use this for that

- Use `ao/token.lua` when a process needs direct token actions (`Info`, `Balance`, `Transfer`, `Claim`, `Mint`).
- Use `scripts/deploy-token.mjs` when a deployment needs machine-checkable interaction proof, not only a spawn ID.
- Use `codebases/mux/` and `codebases/permaweb-libs/` only as secondary integration references after this flow is established.

## Evidence

- [scripts/deploy-token.mjs](../../scripts/deploy-token.mjs)
- [docs/scripts/deploy-token.md](../../docs/scripts/deploy-token.md)
- [WORKING-PATTERNS.md](../../WORKING-PATTERNS.md)
