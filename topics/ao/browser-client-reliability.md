# Browser AO client reliability

This page separates signer-free reads from wallet-signed writes and defines safe failure handling for AO browser clients.

## Identify the AO protocol first

- LegacyNet clients commonly use `@permaweb/aoconnect` message, result, and dry-run APIs with scheduler and process IDs.
- AO-Core and HyperBEAM clients commonly resolve state through HTTP methods and device paths.
- Do not treat their process IDs, module IDs, scheduler IDs, endpoints, or result shapes as interchangeable.
- Keep protocol mode, read endpoints, the single write endpoint, scheduler context when required, and timeouts explicit in configuration.

## Read path

- Keep public browsing and startup reads usable without a connected wallet.
- For LegacyNet, use `dryrun` or another signer-free read API when the process exposes a deterministic read action.
- For AO-Core, use the appropriate `GET` or `HEAD` resolution path when the device or process exposes one.
- Use a signed message for a read only when the protocol intentionally requires authenticated state access.
- Validate the returned action, status, and payload shape. Transport success alone is not semantic success.
- Bounded retries and endpoint failover are appropriate for idempotent reads. Record which read provider produced the response.
- Independent signer-free reads may run in bounded parallel groups.

## Write path

- Start a write only from an explicit user action.
- Request the minimum wallet permissions at the moment they are needed.
- Prepare and validate the exact process, action tags, payload, and destination before requesting a signature.
- Choose one write route before signing. Do not rotate through `AO_FALLBACK_URLS` for a signed, non-idempotent message.
- Serialize wallet prompts and dependent process turns. This avoids overlapping approvals and preserves action order.
- Preserve the message ID and inspect `result(...)` or the protocol's application state before reporting success.
- Validate both transport-level and application-level failures, including error actions and protocol-specific rejection payloads.

Use the shared [write lifecycle](../permaweb/write-lifecycle.md) for status reporting.

## Timeout and retry rules

- An idempotent read timeout may use bounded retry or a different read provider.
- A failure proven to occur before submission is `failed-before-submit`. A new attempt still requires the user's write intent to remain current.
- A timeout after submission may have crossed the write boundary. Mark it `unknown-outcome`, preserve any known ID or payload fingerprint, and reconcile before retrying.
- Do not automatically replay a signed AO action unless the protocol provides an effective idempotency key.
- Provider acceptance or a message ID is not proof that a handler ran successfully.

## Concurrency

- Run independent signer-free reads concurrently within a bounded limit.
- Serialize signature prompts.
- Serialize writes whose process semantics depend on order.
- Do not block public reads behind wallet connection or signing queues.

## Common failure signatures

- `Uncaught ReferenceError: process is not defined`
  - Cause: a dependency expects Node-like globals in browser bundles.
  - Mitigation: inject a minimal browser-safe `process` shim before app code executes.
- `Cannot read properties of undefined (reading 'slice')` from bundled AO deps
  - Cause: dependency assumes `process.version` exists.
  - Mitigation: ensure shim sets a string `process.version`.
- `POST .../push 500` or repeated send timeouts
  - Cause: route failure, missing protocol context, or an ambiguous submission timeout.
  - Mitigation: preserve the message identity, classify the last known write state, and reconcile against the same protocol before offering a new attempt.
- UI hangs in "posting..." state
  - Cause: unresolved transport promise path or swallowed timeout/error.
  - Mitigation: enforce send and result timeouts, surface `unknown-outcome` separately from `rejected`, and keep a reconciliation action available.
- Browser asks for a wallet during initial page load
  - Cause: public reads were implemented as signed messages or placed behind a shared wallet gate.
  - Mitigation: move public reads to dry-run or HTTP resolution paths and request permissions only for an explicit protected action.

## Use this for that

- Use this page when an AO browser app asks for unnecessary signatures, works intermittently, or times out around writes.
- Use [topics/ao/process-blueprints.md](process-blueprints.md) for deploy harness rules.
- Use [topics/ao/token-blueprints.md](token-blueprints.md) for token-specific proof flow.
- Use [WORKING-PATTERNS.md](../../WORKING-PATTERNS.md) for short reusable patterns shared across deploy and runtime logic.

## Evidence

- [WORKING-PATTERNS.md](../../WORKING-PATTERNS.md)
- [topics/ao/process-blueprints.md](process-blueprints.md)
- [topics/ao/token-blueprints.md](token-blueprints.md)
