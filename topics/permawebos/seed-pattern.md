# PermawebOS Seed Pattern

The PermawebOS seed pattern is the bridge between an app URL and an LLM being able to produce a new permanent fork.

## Primary local sources

- [../../AGENTS.md](../../AGENTS.md)
- [../../resources/permawebos/final-seed-checklist.md](../../resources/permawebos/final-seed-checklist.md)
- [../../resources/arweave/deploy-up.mjs](../../resources/arweave/deploy-up.mjs)
- [../../resources/arweave/manifest.example.json](../../resources/arweave/manifest.example.json)

## Core idea

A seed app is packaged so an agent can:

- discover the code archive
- read the app-specific instructions
- modify the app locally
- redeploy a fork
- preserve provenance back to the parent app

## Required ingredients

The local seed pattern repeatedly depends on:

- app URL that resolves to a manifest
- discoverable code archive
- machine-readable instructions such as `AGENTS.md`
- deploy scripts
- `forked-from` lineage tags
- deploy output that includes both app URL and code archive URL
- a wallet operation model that is explicit for browser dApps (`window.arweaveWallet` + `arweave-js`)

## Final-seed hardening

The current repo-scoped checklist for a hardened seed release is:

- keep `AGENTS.md` in the app archive so the next agent can recover repo-specific rules
- publish a code archive and make it discoverable from the public app object
- keep `forked-from` lineage explicit on release artifacts
- record deploy evidence in a machine-readable file or log
- preserve release inputs such as version, archive ID, and manifest ID
- make the ship path scriptable rather than conversational

This is useful because it turns "please deploy after edits" into something the repo can actually enforce.

## Why this matters

Without this pattern, LLM-driven app iteration tends to collapse back into:

- local-only forks
- missing provenance
- no durable deploy evidence
- no clear handoff path for the next agent

With this pattern, an app becomes a durable branchable artifact rather than a one-off local clone.

## Evidence

- [../arweave/deploying-web-apps.md](../arweave/deploying-web-apps.md)
- [../arweave/wallet-operations.md](../arweave/wallet-operations.md)
- [workspace-model.md](workspace-model.md)
