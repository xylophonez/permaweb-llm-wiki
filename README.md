# Permaweb LLM Wiki

This repo is a persistent, agent-maintained wiki for Permaweb and AO building knowledge.

The maintained synthesis lives under `topics/`. Supporting evidence and examples live in `ao/`, `scripts/`, `docs/scripts/`, `codebases/`, `resources/`, and generated run logs under `runs/`.

## Start here

- `AGENTS.md`: maintenance workflow and repo rules.
- `index.md`: current catalog of pages and evidence.
- `log.md`: append-only ingest and lint history.
- `topics/permaweb/release-policy.md`: local iteration, explicit release authorization, and source-linked release evidence.
- `topics/permaweb/write-lifecycle.md`: shared state model for signed writes, propagation, and completion.

## Current focus

- when AO is warranted and when GraphQL is enough
- how local AO process blueprints are written and validated
- how static Arweave apps should build, publish manifests, and update optional names or references
- how agents should preserve inspectable project context without imposing a project-specific release format

## Useful local evidence

- `ao/`: small AO process examples
- `scripts/`: AO deploy, interaction, and state-read harnesses
- `docs/scripts/`: script behavior and CLI notes
- `codebases/`: larger supporting examples such as `mux` and `permaweb-libs`
- `resources/`: repo-scoped examples added when an external reference needed to be pulled into scope

## AO example commands

```bash
npm run deploy:counter
npm run test:counter
npm run deploy:task-board
npm run deploy:token
```

## UI deploy policy helpers

```bash
npm run policy:ui-check
npm run policy:ui-check:predeploy
npm run policy:ui-check:release
npm run release:record-ui -- --summary=./runs/deploy-summary.json --title="App Name" --description="What changed"
```

The first two commands are read-only status checks. Use the strict release check and evidence recorder only inside a user-authorized publish flow. Configure tracked UI source roots in `data/ui-policy.json`.
