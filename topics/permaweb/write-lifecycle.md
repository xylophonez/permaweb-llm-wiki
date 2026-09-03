# Permaweb write lifecycle

Use this state model for Arweave uploads, static app releases, AO messages, Bazar mutations, and reference updates. It prevents a returned ID or a transport timeout from being reported as more certain than it is.

Not every write passes through every state. Define the completion conditions for the operation before asking for a signature.

## States

| State | What is known | What is not yet proven |
| --- | --- | --- |
| `prepared` | The exact payload and target exist locally. | The user has approved or signed it. |
| `awaiting-authorization` | A wallet approval or signature request is visible to the user. | Approval, signature, or submission. |
| `signed` | The wallet signed the exact payload. | The payload reached a write service. |
| `submitted` | The client began or completed a send attempt. | Provider acceptance when no documented response was received. |
| `accepted` | The selected provider returned documented acceptance and an ID. | Mining, AO application, indexing, or gateway availability. |
| `confirmed` | The write met its configured chain confirmation rule. | AO application, index visibility, or content availability when those are separate. |
| `applied` | The owning AO process or protocol state includes the effect. | Index or gateway visibility. |
| `indexed` | A designated query or search index returns the write. | Every index or gateway has caught up. |
| `available` | The intended content or application URL resolves and matches the expected artifact. | Nothing beyond the operation's remaining completion conditions. |
| `complete` | Every condition defined for this operation has been observed. | Nothing required by that operation. |
| `rejected` | The write target explicitly rejected the request. | Whether another target or payload would succeed. |
| `unknown-outcome` | A send may have crossed the network boundary, but the response was lost or timed out. | Whether replaying it would duplicate the effect. |
| `failed-before-submit` | The client can prove no write left the local boundary. | Whether a new, explicitly authorized attempt would succeed. |

## Safety rules

- Ask for wallet permissions and a signature only after the user initiates the write and the exact payload is ready.
- Choose one write destination before signing. Provider lists are useful for read health checks, not automatic write replay.
- Preserve the payload fingerprint, provider, returned IDs, timestamps, and last observed state.
- Treat a timeout after a possible submission as `unknown-outcome`. Reconcile against the returned or locally known ID and protocol state before offering another attempt.
- Automatically retry only idempotent reads with a bounded policy, or writes whose protocol supplies and honors an idempotency key.
- Never downgrade a known accepted or applied write merely because an index or gateway has not caught up.
- Report the state that was observed. Do not use "published," "minted," "transferred," or "complete" when only submission or acceptance is known.

## Completion profiles

### Static app release

Typical required observations:

1. source and release payload prepared
2. explicit release authorization received
3. archive, assets, and manifest accepted with IDs
4. manifest URL resolves through the designated gateway
5. resolved content matches the expected release
6. source fingerprint and IDs recorded

The release is not `complete` at the first returned transaction or data-item ID.

### AO message

Typical required observations:

1. message signed and submitted to one route
2. message ID preserved when returned
3. result inspected for transport and application-level errors
4. owning process state or protocol reply confirms the intended effect

A message ID proves neither scheduling nor successful handler execution. If the result call times out, keep the message ID and reconcile instead of sending the action again automatically.

### Bazar mutation

Typical required observations depend on the action, but may include:

1. signed write accepted with an ID
2. transaction confirmed when L1 inclusion is required
3. owning process state reflects the mint, listing, purchase, or transfer
4. Bazar's index returns the updated object
5. content URLs resolve where availability is part of the action

UI progress should show these as separate stages so index lag is not mistaken for a failed or duplicated write.

## Related guidance

- [Permaweb build and release policy](release-policy.md)
- [Browser AO client reliability](../ao/browser-client-reliability.md)
- [Deploying web apps](../arweave/deploying-web-apps.md)
- [Wallet operations](../arweave/wallet-operations.md)
- [Bundlers and gateways](../arweave/bundlers-and-gateways.md)
