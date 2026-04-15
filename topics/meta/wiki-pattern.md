# Wiki Pattern

This repo follows a persistent LLM wiki pattern rather than a pure RAG pattern.

## Core idea

Instead of rediscovering knowledge from raw files on every question, the agent maintains an interlinked markdown wiki that accumulates synthesis over time.

The wiki is the durable middle layer between:

- raw sources
- current requests
- future agents

## Layers

### Raw sources

These are the local repos, scripts, resource examples, and run artifacts.

They are the source of truth.

### The wiki

These are the files under `topics/` plus `index.md` and `log.md`.

This layer is where the agent should:

- summarize
- cross-reference
- fold in new findings
- preserve contradictions
- keep the current best synthesis

### The schema

[AGENTS.md](../../AGENTS.md) is the maintenance contract for the wiki.

## Operations

### Ingest

When a new source arrives, the agent should update the relevant wiki pages, update `index.md`, and append an entry to `log.md`.

### Query

When answering, the agent should search the wiki first, then drill down into raw evidence only where needed.

### Lint

The agent should periodically look for:

- contradictions
- stale guidance
- orphan pages
- concepts with no dedicated page
- missing links to concrete scripts or examples

## Why this repo uses it

The Permaweb/AO stack has enough moving parts that rediscovering the same distinctions every session is wasteful.

The highest-value distinctions here are things like:

- when AO is actually warranted
- when GraphQL is enough
- what the local deploy order is
- which tags and artifacts matter
- which scripts and blueprints are already known-good

Those should live in maintained markdown pages, not only in chat history.
