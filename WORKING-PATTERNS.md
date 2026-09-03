# Working patterns for AO processes

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
2. Identify the protocol and validate scheduler, module, and process identifiers for that protocol.
3. Probe candidate endpoints with idempotent reads only.
4. Select one write URL before signing.
5. Run one explicitly authorized lifecycle on that URL:
   - `spawn`
   - `Eval`
   - protocol-specific actions
6. Assert semantic results, not just transport success or returned IDs.
7. Persist full run log JSON with IDs, last observed lifecycle state, and attempt telemetry.

If a send is proven to fail before submission, an operator may choose a new route for a new authorized attempt. If submission may have occurred, reconcile the existing ID or payload before any replay.

## Browser interaction pattern

- Use signer-free reads where the protocol supports them: LegacyNet `dryrun` or read APIs, and AO-Core `GET` or `HEAD` resolution.
- Request wallet permissions only for an explicit action that needs identity or signing.
- Include scheduler context when the selected LegacyNet flow requires it.
- Choose one write route before signing and do not automatically retry or fail over an ambiguous send.
- Serialize signature prompts and ordered process writes; allow bounded concurrency for independent public reads.
- Preserve IDs and reconcile `unknown-outcome` writes before another attempt.
- Report application state separately from provider acceptance and index visibility.

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
- Run a standard deploy test against one selected write route.
- Run an idempotent read-failover test separately.
- Simulate an ambiguous write timeout and assert that the harness does not replay the signed action.
- Assert:
  - the selected write URL is stable for the attempt
  - returned IDs are preserved
  - semantic state checks pass before completion
  - ambiguous writes enter reconciliation instead of retry

## Extracted guidance from cloned codebases

From `codebases/permaweb-libs`:
- Separate write path (`sendMessage`) from read path (`readProcess` / `readState`).
- Keep APIs action-driven and tag-centric.

From `codebases/mux`:
- Treat process actions as explicit protocol surface.
- Prefer machine-checkable payloads and clear state transitions.
- Keep process state observable through deterministic read handlers.

## Versioned example values

The local harnesses currently contain concrete scheduler, module, and push URL values. Treat them as versioned examples tied to those scripts, not universal AO defaults. Validate them against the protocol and environment before a new run.
