# PermawebOS Workspace Model

PermawebOS is best treated as a workspace-plus-agent system rather than a plain chat surface.

## Core shape

- each user gets a workspace
- a specialist builder agent operates inside or alongside that workspace
- the workspace holds the durable project context
- the UI talks to the workspace runtime rather than only passing chat turns

## Context model

Prefer filesystem-visible context over one giant prompt blob:

- markdown wiki pages
- app-specific instructions
- deploy scripts
- concrete example repos or resource examples
- run artifacts and state snapshots

This makes context inspectable, patchable, and reusable across sessions and agents.

## Release model

Treat release as distinct from iterative previews:

- intermediate builds are workspace states
- release creates the public artifact others should discover
- the released app object should preserve lineage, versioning, and preview metadata

## What belongs in the workspace

Keep durable, inspectable context in files:

- `AGENTS.md` or equivalent instructions
- deploy and validation scripts
- manifest examples and GraphQL snippets
- evidence logs for recent successful releases
- a small number of concrete examples that show the expected packaging and tagging rules

## Why this matters for LLMs

This model is useful because it turns "context" into versioned project state:

- another agent can inspect the same files
- release steps can be audited after the fact
- deploy rules can survive beyond a single chat
- provenance can move with the app rather than staying trapped in local history
