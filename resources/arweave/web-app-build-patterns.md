# Web app build patterns

These patterns capture the reusable parts of plain-static and Vite application builds without imposing a product-specific packaging model.

## Two valid patterns

Both of these work for Permaweb applications:

- plain static HTML, CSS, and JavaScript
- Vite builds that emit a static `dist/`

The framework is secondary. The final output must be publishable as static files with manifest-safe paths.

## Plain static pattern

- keep `index.html` and styles as first-class files
- bundle browser JavaScript only when needed
- copy public assets into the output directory
- keep filenames and folder layout easy to inspect

Use this when the app is mostly static, direct editability matters, or minimal build machinery is valuable.

## Vite static pattern

- set `base: './'` when deployment paths vary
- build into `dist/`
- keep head assets and emitted chunks gateway-resolvable
- avoid assuming the app is always served from `/`
- add deliberate browser polyfills only when installed dependencies require them

Use this when the application benefits from React, TypeScript, code splitting, or Vite development ergonomics.

## Shared deployment invariants

Both patterns should end with:

- a complete static output directory
- asset URLs that work through the intended gateway, path, name, or reference
- no hidden runtime server dependency
- a version `0.2.0` path manifest
- a fallback entry when the application needs SPA or not-found routing

Use [`@permaweb/deploy`](../../topics/arweave/permaweb-deploy.md) as the primary folder deployment tool. The low-level uploader is an educational example for integrations that need direct control over data items and tags.
