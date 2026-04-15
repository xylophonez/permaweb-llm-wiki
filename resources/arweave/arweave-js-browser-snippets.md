# arweave-js Browser Snippets

These snippets are extracted from [../../docs/arweave-js.md](../../docs/arweave-js.md) and adapted into concise browser-first examples.

## Initialize in browser

```ts
import Arweave from "arweave";

// Gateway-relative default, recommended when running on a gateway host
const arweave = Arweave.init({});
```

## Initialize with explicit gateway

```ts
import Arweave from "arweave";

const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https"
});
```

## Create and tag a data transaction

```ts
const tx = await arweave.createTransaction({
  data: "<html><body>Hello permaweb</body></html>"
});

tx.addTag("Content-Type", "text/html");
tx.addTag("App-Name", "example-app");
```

## Chunked upload flow

```ts
const uploader = await arweave.transactions.getUploader(tx);

while (!uploader.isComplete) {
  await uploader.uploadChunk();
  console.log(`${uploader.pctComplete}% complete`);
}
```

## Confirm transaction status

```ts
const status = await arweave.transactions.getStatus(tx.id);
const confirmations = status?.confirmed?.number_of_confirmations ?? 0;
```

## Notes

- For large batches, prefer bundling workflows instead of plain per-transaction upload loops.
- `transactions.post()` only means a node accepted the transaction, not that it is confirmed.
