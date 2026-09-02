# Index

This is the content-oriented catalog for the Permaweb LLM Wiki.

## Meta

- [README.md](README.md): repo purpose and layout.
- [AGENTS.md](AGENTS.md): schema for how the wiki should be maintained.
- [topics/meta/wiki-pattern.md](topics/meta/wiki-pattern.md): persistent wiki model used by this repo.
- [topics/meta/workspace-context.md](topics/meta/workspace-context.md): file-based project context that remains inspectable across agents and sessions.
- [log.md](log.md): append-only ingest and lint history -- create this on initialization if it does not exist.

## AO

- [topics/ao/when-to-use-ao.md](topics/ao/when-to-use-ao.md): decision rule for AO vs. GraphQL.
- [topics/ao/process-blueprints.md](topics/ao/process-blueprints.md): local AO process examples, versioned harness values, and write-route safety.
- [topics/ao/token-blueprints.md](topics/ao/token-blueprints.md): single maintained token deployment and interaction-proof flow.
- [topics/ao/browser-client-reliability.md](topics/ao/browser-client-reliability.md): signer-free reads, single-route writes, timeout reconciliation, and protocol boundaries.

## Permaweb

- [topics/permaweb/release-policy.md](topics/permaweb/release-policy.md): local iteration, explicit release authorization, and source-linked release evidence.
- [topics/permaweb/write-lifecycle.md](topics/permaweb/write-lifecycle.md): shared prepared, signed, accepted, applied, indexed, available, and ambiguous write states.

## Arweave

- [topics/arweave/deploying-web-apps.md](topics/arweave/deploying-web-apps.md): static build, deployment order, and manifest guidance.
- [topics/arweave/permaweb-deploy.md](topics/arweave/permaweb-deploy.md): current `@permaweb/deploy` CLI guidance for uploads, names, references, uploader selection, deduplication, and CI.
- [topics/arweave/up-arweave.md](topics/arweave/up-arweave.md): where `up.arweave.net` fits in the local publish model.
- [topics/arweave/graphql.md](topics/arweave/graphql.md): GraphQL as the default discovery layer for simpler app behaviors.
- [topics/arweave/bundlers-and-gateways.md](topics/arweave/bundlers-and-gateways.md): read-path vs. write-path distinction from local SDK code.
- [topics/arweave/wallet-operations.md](topics/arweave/wallet-operations.md): recommended wallet and browser `arweave-js` integration patterns.

## Resources

- [resources/README.md](resources/README.md): repo-scoped examples pulled into scope for the wiki.
- [resources/arweave/deploy-up.mjs](resources/arweave/deploy-up.mjs): low-level static asset and manifest upload example.
- [resources/arweave/graphql-reference.md](resources/arweave/graphql-reference.md): local GraphQL helper contract and supported query fields.
- [resources/arweave/manifest.example.json](resources/arweave/manifest.example.json): manifest reference shape.
- [resources/arweave/graphql-snippets.md](resources/arweave/graphql-snippets.md): app-discovery query snippets.
- [resources/arweave/web-app-build-patterns.md](resources/arweave/web-app-build-patterns.md): plain-static and Vite build guidance for permaweb apps.
- [resources/arweave/wallets-injected-api-snippets.md](resources/arweave/wallets-injected-api-snippets.md): minimal Wander Injected API operations for dApps.
- [resources/arweave/arweave-js-browser-snippets.md](resources/arweave/arweave-js-browser-snippets.md): browser-focused `arweave-js` initialization and tx flows.
- [data/ui-policy.json](data/ui-policy.json): tracked source roots and exclusions for UI deploy policy enforcement.

## Evidence

- [WORKING-PATTERNS.md](WORKING-PATTERNS.md): retained AO authoring and deploy evidence.
- [docs/wallets.md](docs/wallets.md): raw wallet API source corpus.
- [docs/arweave-js.md](docs/arweave-js.md): raw `arweave-js` source corpus.
- [ao/](ao/): local AO blueprints and examples.
- [scripts/](scripts/): local deploy and interaction harnesses.
- [docs/scripts/](docs/scripts/): script behavior and CLI notes.
- [docs/scripts/ui-policy-check.md](docs/scripts/ui-policy-check.md): advisory UI source status check and strict authorized-release evidence gate.
- [docs/scripts/record-ui-release.md](docs/scripts/record-ui-release.md): records source-linked evidence for an authorized UI release.
- [codebases/README](codebases/README): supporting example codebases in scope.
