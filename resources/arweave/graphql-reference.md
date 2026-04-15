# GraphQL Reference

This repo does not contain a generic prose GraphQL spec for Arweave queries.

The closest repo-scoped "spec" is the local query contract implemented in:

- [../../codebases/permaweb-libs/sdk/src/common/gql.ts](../../codebases/permaweb-libs/sdk/src/common/gql.ts)
- [../../codebases/permaweb-libs/sdk/src/helpers/types.ts](../../codebases/permaweb-libs/sdk/src/helpers/types.ts)

Use this page as the maintained reference for what the local helper actually supports.

## Supported query inputs

The local helper supports these inputs:

- `id`
- `ids`
- `tags`
- `owners`
- `recipients`
- `cursor`
- `paginator`
- `minBlock`
- `maxBlock`
- `sort`

The tag-filter shape is:

```ts
type TagFilterType = { name: string; values: string[]; match?: string }
```

The local sort shape is:

```ts
type GQLSortType = 'ascending' | 'descending'
```

Which the helper translates to:

- `ascending` -> `INGESTED_AT_ASC`
- `descending` -> `INGESTED_AT_DESC`

## Supported query forms

The helper builds two kinds of queries:

- `transaction(id: ...)` for single-ID lookup
- `transactions(...)` for filtered search

For filtered search, the local helper can include:

- `ids`
- `tags`
- `first`
- `owners`
- `recipients` for the AO search gateway path
- `block: { min, max }`
- `after`
- `sort`

## Returned fields

The helper expects transaction edges with:

- `cursor`
- `node.id`
- `node.tags { name, value }`
- `node.data { size, type }`
- `node.owner { address }`
- `node.block { height, timestamp }`

For AO search gateway queries, it also expects:

- `count` on the first page
- `node.recipient`

## Gateway behavior

The helper distinguishes between:

- `arweave.net`
- `ao-search-gateway.goldsky.com`

If a gateway URL has no explicit path, the helper defaults it to `/graphql`.

## Use this for that

- Use [graphql-snippets.md](graphql-snippets.md) when you need ready-made queries.
- Use this page when you need to know which filters and fields the local helper actually supports.
- Use `gql.ts` directly when changing helper behavior or debugging a query mismatch.
