# PermawebOS Core Loop Policy

This page defines the mandatory loop for UI-side changes in browser app workspaces that use this wiki as the default knowledge layer.

## Mandatory loop

For every task that changes tracked UI sources:

1. apply the change
2. ensure a deploy signer key is available (`wallet.json` generation is required when missing and no explicit wallet path is provided)
3. deploy the updated web app
4. record deploy evidence tied to the current UI source fingerprint
5. emit one structured app-card line in the assistant response

## Structured response contract

Successful deploy response line:

```text
PERMAWEB_APP {"url":"https://arweave.net/<manifestId>","manifestId":"<manifestId>","archiveUrl":"https://arweave.net/<archiveId>","archiveId":"<archiveId>","title":"<app name>","description":"<short release note>"}
```

Failed deploy response line:

```text
PERMAWEB_APP_ERROR {"reason":"<short reason>","stage":"<deploy stage>"}
```

Use exactly one `PERMAWEB_APP ...` line for each successful deploy attempt that should be presented as a UI card.

## Local enforcement scripts

- `npm run policy:ui-check`
  - fails when tracked UI source hash differs from `data/last-ui-deploy.json`
- `npm run policy:ui-check:predeploy`
  - allows mismatch during the deploy-in-progress phase
- `npm run deploy:record-ui -- --summary=<deploy-summary.json> --title=<title> --description=<note>`
  - writes `data/last-ui-deploy.json`
  - prints canonical `PERMAWEB_APP ...` line for direct reuse in assistant output

Tracked sources are configured by [../../data/ui-policy.json](../../data/ui-policy.json).

By default, policy checks should fail when no configured UI source roots resolve to tracked files.
Use `ALLOW_NO_UI_ROOTS=1` only for intentional non-UI runs.

## Wallet prerequisite for deploy

Script-driven deploys in this policy expect a raw Arweave JWK JSON key.

- expected shape: RSA JWK fields (`kty`, `n`, `e`, `d`, `p`, `q`, `dp`, `dq`, `qi`)
- if `--wallet` and `ARWEAVE_WALLET` are absent and `wallet.json` does not exist in app root, the agent should generate `wallet.json` before deploy
- AO-specific config files should not be assumed to be valid deploy keys
- `wallet.json` must be gitignored in app repos

Minimal generation pattern:

```js
import Arweave from "arweave";
import { writeFile } from "node:fs/promises";

const arweave = Arweave.init({ host: "arweave.net", port: 443, protocol: "https" });
const jwk = await arweave.wallets.generate();
await writeFile("./wallet.json", `${JSON.stringify(jwk, null, 2)}\n`, "utf8");
```

## Identity baseline for social or user-authored apps

When the app includes authored content (posts, notes, comments, profiles), wallet identity should be primary:

- use connected wallet address as canonical actor identity
- treat handle/display name fields as mutable metadata, not primary identity
- keep authored objects attributable to wallet-derived actor identity

Reference: [../arweave/wallet-operations.md](../arweave/wallet-operations.md)

## Storage baseline (Arweave-first)

For app/user data uploads, default to Arweave-first persistence:

- user-authored data uploads should be written to Arweave
- local/browser storage may be used for drafts, cache, and optimistic UI state
- local/browser-only persistence should not be treated as the canonical durable source of truth

Reference: [../arweave/deploying-web-apps.md](../arweave/deploying-web-apps.md)

## Evidence contract

`data/last-ui-deploy.json` should contain:

- `timestamp`
- `appUrl`
- `manifestId`
- `archiveUrl`
- `archiveId`
- `sourceHash`
- `cardLine`

Optional:

- `title`
- `description`
- `sourceFileCount`
- `trackedRoots`

The deploy summary consumed by `deploy:record-ui` should use canonical keys:

- `appUrl`
- `manifestId`
- `archiveUrl`
- `archiveId`

## Source alignment

This contract is aligned with the deploy summary shape used in [../../resources/arweave/deploy-up.mjs](../../resources/arweave/deploy-up.mjs), which already emits `appUrl`, `archiveUrl`, `manifestId`, and `archiveId`.
