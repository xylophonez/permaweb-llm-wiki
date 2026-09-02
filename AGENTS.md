# AGENTS.md

This repo is a persistent markdown wiki maintained by an LLM.

The job is not to re-derive everything from raw sources on every query. The job is to keep a durable, interlinked knowledge base current.

## Build and release boundary

UI work does not authorize a permanent write. For ordinary UI tasks:

1. apply the requested change
2. run the relevant local checks and build
3. preview locally when useful
4. report the local result and any remaining verification boundary

Publish only when the user explicitly asks to deploy, publish, release, or otherwise authorizes the permanent write. An authorized release must:

1. identify the exact release target and current source state
2. use a signer already selected by the user or project
3. request signing only when the release payload is ready
4. submit once to the selected write target
5. record returned IDs and the current UI source fingerprint
6. verify the operation-specific completion conditions

Do not create, import, replace, or export a wallet merely to unblock a release. Prefer a connected browser wallet so the key remains behind the wallet adapter. A missing signer blocks a script-driven release until the user supplies or selects one.

Repo-level enforcement helpers:

- `npm run policy:ui-check`: reports whether tracked UI sources match release evidence without publishing or blocking local work
- `npm run policy:ui-check:predeploy`: compatibility alias for an advisory check during release preparation
- `npm run policy:ui-check:release`: strict post-deploy gate for an explicitly authorized release
- `npm run release:record-ui -- --summary=<deploy-summary.json> --title=<title> --description=<note>`: writes source-linked evidence to `data/last-ui-release.json`

Tracked UI paths are configured in `data/ui-policy.json`.

Signer requirement for script-driven publishes:

- local deploy signing expects a raw Arweave JWK JSON key (RSA JWK fields such as `kty`, `n`, `e`, `d`, `p`, `q`, `dp`, `dq`, `qi`)
- use only an explicit `--wallet`, `ARWEAVE_WALLET`, or already selected project signer
- if no signer is available, stop and ask the user to select one; do not generate `wallet.json` automatically
- do not assume AO-specific config files are valid deploy keys
- `wallet.json` must be gitignored in app repos

Deploy summary schema requirement for `release:record-ui`:

- canonical required keys: `appUrl`, `manifestId`
- do not rely on alias field names for policy evidence recording

See [topics/permaweb/release-policy.md](topics/permaweb/release-policy.md) for the maintained build and release boundary.
See [topics/permaweb/write-lifecycle.md](topics/permaweb/write-lifecycle.md) for signing, submission, reconciliation, and completion states.

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
- `topics/permaweb/release-policy.md`
- `topics/permaweb/write-lifecycle.md`

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
- For user-authored apps, treat wallet address as the primary identity layer; handles/display names are secondary metadata (see [topics/arweave/wallet-operations.md](topics/arweave/wallet-operations.md)).
- Use Arweave-first storage for uploads: app/user data uploads should persist to Arweave; local/browser storage is cache or draft state, not the canonical durable record.
- Use relative links inside the repo. Do not write machine-specific absolute paths.
