# Permaweb LLM Wiki

This repo is a persistent, agent-maintained wiki for Permaweb and AO building knowledge.

The maintained synthesis lives under `topics/`. Supporting evidence and examples live in `ao/`, `scripts/`, `docs/scripts/`, `codebases/`, `resources/`, and generated run logs under `runs/`.

## Start here

- `AGENTS.md`: maintenance workflow and repo rules.
- `index.md`: current catalog of pages and evidence.
- `log.md`: append-only ingest and lint history.

## Current focus

- when AO is warranted and when GraphQL is enough
- how local AO process blueprints are written and validated
- how static Arweave app deploys should package manifests, code archives, and provenance
- how PermawebOS-style seed apps should preserve instructions and redeploy paths for later agents

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
