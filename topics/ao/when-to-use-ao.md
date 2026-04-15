# When To Use AO

AO should not be presented as the default for everything.

## Default rule

Start from the assumption that many app behaviors can be handled with immutable Arweave data plus GraphQL discovery.

Reach for AO when the hard part is process-enforced state transitions, not record retrieval.

## Good fits for AO

- token balances, minting, transfers, reward logic, or treasury execution
- owner-gated or role-gated writes that should be enforced by the process itself
- shared mutable state where message order and explicit transitions matter
- protocols that need machine-checkable action replies rather than passive data lookup
- cases where client-side reconciliation is starting to feel like rebuilding a process runtime by hand

## Cases where GraphQL is probably enough

- app and manifest discovery by tags
- latest artifact lookup by owner, app name, or version tags
- immutable content feeds
- filtered views over uploads or messages
- data views that can be reconstructed cheaply from historical records
- cases where "permissions" are really just read filtering rather than enforced write control

## Practical heuristic

Use this rule of thumb:

- If the app mainly reads immutable data, prefer Arweave plus GraphQL.
- If the app needs token logic, enforced writes, or coordinated mutable state, evaluate AO.
- If the client is doing heavy dedupe, reconciliation, permission simulation, or conflict resolution, that is a signal to reconsider AO.

## Borderline cases

Reaction systems, counters, and lightweight coordination can work either way.

- Keep them in GraphQL when reconciliation is simple and auditable.
- Move them to AO when the bookkeeping becomes the dominant complexity.

## Evidence

- [../arweave/graphql.md](../arweave/graphql.md)
- [process-blueprints.md](process-blueprints.md)
- [../../codebases/permaweb-libs/sdk/src/common/gql.ts](../../codebases/permaweb-libs/sdk/src/common/gql.ts)
