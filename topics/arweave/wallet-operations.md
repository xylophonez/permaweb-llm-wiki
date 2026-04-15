# Wallet Operations

For browser dApps in this repo, the default recommendation is:

- use `window.arweaveWallet` (Wander Injected API) for wallet permissions, address access, signing, and dispatch
- use `arweave-js` for network interactions, transaction construction, tagging, reads, and status checks

## Use this for that

- Use Wander Injected API when the task is wallet access, permissioning, user-selected gateway config, signing with the user wallet, or wallet-native dispatch.
- Use `arweave-js` when the task is creating transactions, adding tags, querying network/block/tx state, or chunked upload handling.
- Use both together for browser publishing flows: build transaction with `arweave-js`, sign/dispatch through Wander.

## Dispatch endpoint control

`dispatch()` uses the bundler node configured by the user/extension.
`connect(..., gateway)` controls Arweave gateway config, not the `dispatch()` bundler endpoint.

If a browser app must target a specific uploader endpoint (for example `https://up.arweave.net`), use `signDataItem()` and upload signed bytes directly.

```ts
await window.arweaveWallet.connect(["SIGN_TRANSACTION"]);

const signed = await window.arweaveWallet.signDataItem({
  data: JSON.stringify(payload),
  tags: [{ name: "Content-Type", value: "application/json" }]
});

await fetch("https://up.arweave.net", {
  method: "POST",
  headers: { "Content-Type": "application/octet-stream" },
  body: signed
});
```

## Browser integration baseline

```ts
import Arweave from "arweave";

await window.arweaveWallet.connect([
  "ACCESS_ADDRESS",
  "ACCESS_ARWEAVE_CONFIG",
  "SIGN_TRANSACTION",
  "DISPATCH"
]);

const address = await window.arweaveWallet.getActiveAddress();
const gateway = await window.arweaveWallet.getArweaveConfig();
const arweave = Arweave.init(gateway);

const tx = await arweave.createTransaction({ data: "hello" });
tx.addTag("Content-Type", "text/plain");
tx.addTag("Sender", address);

const signedFields = await window.arweaveWallet.sign(tx);
tx.setSignature({
  id: signedFields.id,
  owner: signedFields.owner,
  reward: signedFields.reward,
  tags: signedFields.tags,
  signature: signedFields.signature
});

await window.arweaveWallet.dispatch(tx);
```

## Operational guidance

- Always gate wallet calls on `arweaveWalletLoaded` or equivalent readiness checks.
- Keep permission requests minimal and explicit.
- Align gateway usage with `getArweaveConfig()` when the wallet can override gateway settings.
- Check tx status and confirmations before treating tx IDs as finalized.
- For large batch publishing, use bundling-oriented paths instead of raw per-tx posting.

## References

- [../../docs/wallets.md](../../docs/wallets.md)
- [../../docs/arweave-js.md](../../docs/arweave-js.md)
- [../../resources/arweave/wallets-injected-api-snippets.md](../../resources/arweave/wallets-injected-api-snippets.md)
- [../../resources/arweave/arweave-js-browser-snippets.md](../../resources/arweave/arweave-js-browser-snippets.md)
