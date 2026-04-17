# Browser AO Client Reliability

This page captures practical reliability guidance for browser dApps using wallet-signed AO actions.

## Baseline configuration

- Build browser AO clients with explicit scheduler context:
  - `connect({ MODE: "mainnet", URL, SCHEDULER, signer })`
- Keep endpoint and timeout controls explicit in env:
  - `AO_URL`
  - `AO_FALLBACK_URLS`
  - `AO_SCHEDULER`
  - `AO_REQUEST_TIMEOUT_MS`
- Request wallet permissions needed for signed AO actions before runtime reads/writes:
  - `ACCESS_ADDRESS`
  - `SIGN_TRANSACTION`

## Runtime patterns

- Never use `dryrun` for this browser AO interaction flow.
- Use signed `message -> result` for both writes and interactive reads.
- Keep reads and writes action-tag driven, and assert expected reply actions.
- Retry one transient `ao.message(...)` failure before marking an endpoint failed.
- Fail over to the next AO endpoint only after the retry window is exhausted.
- Use transport timeouts that reflect mainnet latency (prefer `>=30s`).

## Concurrency pattern for wallet-signed calls

- Serialize wallet-signed AO actions by default in browser clients.
- Reason: overlapping signed calls can produce transport stalls, extension prompt contention, or misleading hangs.
- Tradeoff: startup reads can become visibly slower.
- If optimization is needed later, parallelize only after proving wallet/provider behavior is stable under concurrent signing.

## Common failure signatures

- `Uncaught ReferenceError: process is not defined`
  - Cause: a dependency expects Node-like globals in browser bundles.
  - Mitigation: inject a minimal browser-safe `process` shim before app code executes.
- `Cannot read properties of undefined (reading 'slice')` from bundled AO deps
  - Cause: dependency assumes `process.version` exists.
  - Mitigation: ensure shim sets a string `process.version`.
- `POST .../push 500` or repeated send timeouts
  - Cause: endpoint transient issues, missing scheduler context, or too-short timeouts.
  - Mitigation: ensure scheduler is explicit, retry transient sends once, then fail over endpoint.
- UI hangs in "posting..." state
  - Cause: unresolved transport promise path or swallowed timeout/error.
  - Mitigation: enforce send/result timeouts and always surface terminal error state to UI.

## Use this for that

- Use this page when an AO browser app works intermittently or is timing out across push endpoints.
- Use [topics/ao/process-blueprints.md](process-blueprints.md) for deploy harness rules.
- Use [topics/ao/token-blueprints.md](token-blueprints.md) for token-specific proof flow.
- Use [WORKING-PATTERNS.md](../../WORKING-PATTERNS.md) for short reusable patterns shared across deploy and runtime logic.

## Evidence

- [WORKING-PATTERNS.md](../../WORKING-PATTERNS.md)
- [topics/ao/process-blueprints.md](process-blueprints.md)
- [topics/ao/token-blueprints.md](token-blueprints.md)
