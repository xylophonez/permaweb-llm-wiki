# Wander Injected API Snippets

These snippets are extracted from [../../docs/wallets.md](../../docs/wallets.md) so the core wallet operations are easy to reuse in this wiki.

## Wait for wallet API and request permissions

```ts
addEventListener("arweaveWalletLoaded", async (e) => {
  const { permissions } = e.detail;

  if (permissions.length === 0) {
    await window.arweaveWallet.connect([
      "ACCESS_ADDRESS",
      "ACCESS_ARWEAVE_CONFIG",
      "SIGN_TRANSACTION",
      "DISPATCH"
    ]);
  }
});
```

## Get active address and gateway config

```ts
await window.arweaveWallet.connect([
  "ACCESS_ADDRESS",
  "ACCESS_ARWEAVE_CONFIG"
]);

const address = await window.arweaveWallet.getActiveAddress();
const gateway = await window.arweaveWallet.getArweaveConfig();
```

## Inspect granted permissions

```ts
const permissions = await window.arweaveWallet.getPermissions();
```

## Sign an arweave-js transaction with Wander

```ts
const signedFields = await window.arweaveWallet.sign(transaction);

transaction.setSignature({
  id: signedFields.id,
  owner: signedFields.owner,
  reward: signedFields.reward,
  tags: signedFields.tags,
  signature: signedFields.signature
});
```

## Dispatch transaction with Wander

```ts
await window.arweaveWallet.connect(["DISPATCH"]);
const res = await window.arweaveWallet.dispatch(transaction);
```

## Sign DataItem and upload to a custom endpoint

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

## Notes

- This API is available on `window.arweaveWallet`.
- Permission grants are per application and should be treated as runtime state.
- Use `getArweaveConfig()` to align gateway usage with the active wallet configuration.
- `dispatch()` uses the wallet's configured bundler node.
