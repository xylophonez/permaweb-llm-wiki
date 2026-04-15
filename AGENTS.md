# AGENTS.md

This repo is a persistent markdown wiki maintained by an LLM.

The job is not to re-derive everything from raw sources on every query. The job is to keep a durable, interlinked knowledge base current.

## Core model

There are three layers:

1. Raw sources
   - Local source repos, scripts, and run artifacts.
   - Treat these as immutable evidence unless the user explicitly asks to edit them.
2. The wiki
   - Markdown pages under `topics/` plus `index.md` and `log.md`.
   - This is the maintained synthesis layer.
3. The schema
   - This file.
   - It tells the agent how to ingest, update, query, and lint the wiki.

## Repo conventions

- Start every research task with `index.md`.
- Keep durable knowledge in `topics/`.
- Keep `index.md` current whenever pages are added, renamed, or materially reframed.
- Keep `log.md` append-only.
- Treat `ao/`, `scripts/`, `docs/scripts/`, `codebases/`, `resources/`, `WORKING-PATTERNS.md`, and generated run artifacts under `runs/` as evidence and examples, not as the primary wiki layer.
- Prefer local example repos and scripts over giant generic documentation dumps.

## Writing rules

- Teach "use this for that", not "everything is AO".
- Prefer short, link-heavy pages to giant monoliths.
- Use local file links for evidence whenever possible.
- Record open questions explicitly rather than smoothing them over.
- If a source is noisy but useful, extract the stable guidance into the wiki and link back to the source.
- Keep examples concrete: file paths, commands, tags, deploy order, invariants.

## Ingest workflow

When adding a new source:

1. Read the source and identify which existing topic pages it should update.
2. Create a new topic page only if the concept does not already have a natural home.
3. Fold the new information into the maintained pages.
4. Add or update cross-links in `index.md`.
5. Append a log entry in `log.md` with a stable heading:
   - `## [YYYY-MM-DD] ingest | <title>`
6. Preserve contradictions and uncertainty:
   - note what changed
   - note what is still unclear
   - note which source currently seems strongest

## Query workflow

When answering a question from this repo:

1. Read `index.md`.
2. Read the relevant topic pages.
3. Drop to raw sources or scripts only where the topic pages need confirmation or exact detail.
4. Cite the maintained pages first, then the raw evidence where needed.
5. If the answer creates durable value, file it back into the wiki.

## Lint workflow

Periodically check for:

- pages with no incoming links
- duplicated concepts split across multiple files
- stale guidance superseded by newer local sources
- claims with no linked evidence
- missing "when to use this" guidance
- missing references to concrete scripts or example repos

If linting finds an issue, fix the wiki and log it.

## Topic priorities

Current priority topics are:

- `topics/ao/when-to-use-ao.md`
- `topics/ao/process-blueprints.md`
- `topics/ao/token-blueprints.md`
- `topics/arweave/deploying-web-apps.md`
- `topics/arweave/up-arweave.md`
- `topics/arweave/graphql.md`
- `topics/arweave/bundlers-and-gateways.md`
- `topics/permawebos/seed-pattern.md`

## Source priority

When guidance conflicts, prefer sources in this order:

1. local scripts and successful run artifacts
2. local example codebases and SDK sources
3. repo-scoped resource examples added under `resources/`
4. historical notes retained in the repo
5. generic large documentation dumps

## Specific standing guidance

- AO is not the default for everything.
- Keep [topics/ao/when-to-use-ao.md](topics/ao/when-to-use-ao.md) disciplined and evidence-backed.
- Use relative links inside the repo. Do not write machine-specific absolute paths.
