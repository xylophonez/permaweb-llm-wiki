# Workspace context for agents

Use file-based project context when work must remain inspectable across sessions, agents, and tools.

## Core shape

- the workspace holds the durable project state
- agent instructions describe repository-specific constraints
- source, validation scripts, and release configuration remain visible as files
- chat provides coordination, not the only copy of important context

Prefer this model for any long-lived software project. It is not specific to one Permaweb product or release format.

## What belongs in the workspace

Keep durable, inspectable context in files such as:

- `AGENTS.md` or equivalent repository instructions
- build, test, and validation scripts
- deployment configuration and manifest examples
- protocol or architecture decisions
- evidence for recent releases when the project needs it
- a small number of concrete examples that show expected behavior

Keep secrets and private wallet material outside tracked project context.

## Release boundary

Treat local work and publication as separate states:

- source changes, builds, tests, and previews can stay local
- publication begins only after explicit authorization
- a selected wallet or protected release signer signs the prepared payload
- release status follows the shared [write lifecycle](../permaweb/write-lifecycle.md)

This separation lets another agent reproduce and audit the work without treating reproducibility as standing permission to publish.
