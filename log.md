# Change log

## [2026-09-02] ingest | Authorization-aware writes and AO reliability

- separated local UI iteration from explicitly authorized permanent release
- replaced automatic wallet generation guidance with user- or project-selected signer requirements
- added a strict post-deploy release evidence check while keeping ordinary checks read-only and advisory
- separated signer-free AO reads from single-route signed writes
- removed automatic signed-message and cross-endpoint replay from the local AO harnesses
- added a shared write lifecycle for accepted, confirmed, applied, indexed, available, complete, and unknown outcomes

## [2026-09-02] ingest | Permaweb Deploy 7.0.0

- made `@permaweb/deploy` the primary documented CLI for static PermawebOS releases
- documented upload-only, Permaweb Name, direct-reference, legacy uploader, HyperBEAM, deduplication, and GitHub Actions paths
- kept explicit authorization and selected-signer requirements at every permanent write boundary
- updated the manifest examples and low-level uploader to version `0.2.0` with optional fallback support
- repositioned `up.arweave.net` as the default legacy route rather than the only recommended deployment path

## [2026-09-02] lint | Generalized Permaweb release guidance

- removed the one-off PermawebOS seed pattern and final-seed checklist
- removed source archives, fork lineage, and app-card output from the default deployment model
- generalized workspace context, release policy, release evidence, GraphQL examples, and the low-level uploader
- kept source archives and application-specific metadata as optional project decisions
