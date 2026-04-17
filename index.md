# Index

This is the content-oriented catalog for the Permaweb LLM Wiki.

## Meta

- [README.md](README.md): repo purpose and layout.
- [AGENTS.md](AGENTS.md): schema for how the wiki should be maintained.
- [topics/meta/wiki-pattern.md](topics/meta/wiki-pattern.md): persistent wiki model used by this repo.
- [log.md](log.md): append-only ingest and lint history -- create this on initialization if it does not exist.

## AO

- [topics/ao/when-to-use-ao.md](topics/ao/when-to-use-ao.md): decision rule for AO vs. GraphQL.
- [topics/ao/process-blueprints.md](topics/ao/process-blueprints.md): local AO process examples, harnesses, defaults, and working patterns.
- [topics/ao/token-blueprints.md](topics/ao/token-blueprints.md): single maintained token deployment and interaction-proof flow.
- [topics/ao/browser-client-reliability.md](topics/ao/browser-client-reliability.md): practical runtime hardening patterns for wallet-signed AO browser clients.

## Arweave

- [topics/arweave/deploying-web-apps.md](topics/arweave/deploying-web-apps.md): deploy order, archive rules, and manifest guidance for static apps.
- [topics/arweave/up-arweave.md](topics/arweave/up-arweave.md): where `up.arweave.net` fits in the local publish model.
- [topics/arweave/graphql.md](topics/arweave/graphql.md): GraphQL as the default discovery layer for simpler app behaviors.
- [topics/arweave/bundlers-and-gateways.md](topics/arweave/bundlers-and-gateways.md): read-path vs. write-path distinction from local SDK code.
- [topics/arweave/wallet-operations.md](topics/arweave/wallet-operations.md): recommended wallet and browser `arweave-js` integration patterns.

## PermawebOS

- [topics/permawebos/workspace-model.md](topics/permawebos/workspace-model.md): durable workspace context, release boundaries, and agent-visible files.
- [topics/permawebos/seed-pattern.md](topics/permawebos/seed-pattern.md): seed release requirements for forkable, LLM-friendly apps.

## Resources

- [resources/README.md](resources/README.md): repo-scoped examples pulled into scope for the wiki.
- [resources/arweave/deploy-up.mjs](resources/arweave/deploy-up.mjs): generic static-app publish script for archive, assets, and manifest.
- [resources/arweave/graphql-reference.md](resources/arweave/graphql-reference.md): local GraphQL helper contract and supported query fields.
- [resources/arweave/manifest.example.json](resources/arweave/manifest.example.json): manifest reference shape.
- [resources/arweave/graphql-snippets.md](resources/arweave/graphql-snippets.md): app-discovery query snippets.
- [resources/arweave/web-app-build-patterns.md](resources/arweave/web-app-build-patterns.md): plain-static and Vite build guidance for permaweb apps.
- [resources/arweave/wallets-injected-api-snippets.md](resources/arweave/wallets-injected-api-snippets.md): minimal Wander Injected API operations for dApps.
- [resources/arweave/arweave-js-browser-snippets.md](resources/arweave/arweave-js-browser-snippets.md): browser-focused `arweave-js` initialization and tx flows.
- [resources/permawebos/final-seed-checklist.md](resources/permawebos/final-seed-checklist.md): hardened seed-release checklist.

## Evidence

- [WORKING-PATTERNS.md](WORKING-PATTERNS.md): retained AO authoring and deploy evidence.
- [docs/wallets.md](docs/wallets.md): raw wallet API source corpus.
- [docs/arweave-js.md](docs/arweave-js.md): raw `arweave-js` source corpus.
- [ao/](ao/): local AO blueprints and examples.
- [scripts/](scripts/): local deploy and interaction harnesses.
- [docs/scripts/](docs/scripts/): script behavior and CLI notes.
- [runs/README.md](runs/README.md): generated run-artifact layout.
- [codebases/README](codebases/README): supporting example codebases in scope.
