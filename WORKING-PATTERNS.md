# Working Patterns for AO Processes

## Authoring pattern (Lua)

- Make state idempotent at top-level: `Var = Var or <default>`.
- Provide one reply helper that supports both runtime forms:
  - `msg.reply(payload)` when present
  - `Send({ Target = msg.From, ... })` fallback.
- Read action tags defensively from either object or array forms (`Tags`, `TagArray`).
- Keep setup one-way:
  - `Init` allowed exactly once
  - owner-gated writes only after `Configured=true`.
- Return explicit action tags on every handler for machine-verifiable assertions.

## Deployment pattern (JS + aoconnect)

1. Sanitize env input.
2. Resolve ordered AO URLs (`AO_URL` then `AO_FALLBACK_URLS`, else defaults).
3. Probe endpoints.
4. For each URL, run full lifecycle:
   - `spawn`
   - `Eval`
   - protocol-specific actions
   - retry one transient `ao.message(...)` send failure before marking the attempt failed
5. Assert semantic results, not just transport success.
6. Persist full run log JSON with attempt telemetry.

## Browser interaction pattern (wallet-signed AO actions)

- Never use `dryrun` in the browser runtime interaction path.
- Use signed `message -> result` reads/writes for runtime behavior.
- Include `SCHEDULER` in `connect(...)` for mainnet browser clients.
- Serialize wallet-signed actions to avoid overlapping signature prompts and transport stalls.
- Use a per-endpoint transient send retry (`ao.message(...)`) before failing over.
- Use realistic transport timeouts (>= 30s) for mainnet push routes.

## Token flow pattern

For token deployments, the required semantic proof is:

1. `Info`
2. `Balance` (before) with explicit `Recipient=<walletAddress>`
3. `Claim`
4. `Balance` (after) with explicit `Recipient=<walletAddress>`
5. Assert `after - before == 10^Denomination`

A deployment is not accepted until both conditions are true:

- a new process ID was returned
- the claim delta assertion passed

## Test pattern (real network integration)

- Validate Lua syntax first: `luac -p ao/counter.lua`.
- Run a standard deploy test (`default-route`).
- Run a forced failover test (`AO_URL=push-2`, fallback to `push-1`).
- Assert:
  - status `ok`
  - selected URL expectation
  - at least 2 attempts for forced fallback
  - semantic state checks pass

## Extracted guidance from cloned codebases

From `codebases/permaweb-libs`:
- Separate write path (`sendMessage`) from read path (`readProcess` / `readState`).
- Keep APIs action-driven and tag-centric.

From `codebases/mux`:
- Treat process actions as explicit protocol surface.
- Prefer machine-checkable payloads and clear state transitions.
- Keep process state observable through deterministic read handlers.

## Reliable defaults

- `AO_SCHEDULER`: `n_XZJhUnmldNFo4dhajoPZWhBXuJk-OcQr5JQ49c4Zo`
- `AO_MODULE`: `ISShJH1ij-hPPt9St5UFFr_8Ys3Kj5cyg7zrMGt7H9s`
- AO URL priority:
  1. `https://push-1.forward.computer`
  2. `https://push-2.forward.computer`
