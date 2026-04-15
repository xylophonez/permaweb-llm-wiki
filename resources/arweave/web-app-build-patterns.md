# Web App Build Patterns

These patterns are distilled from a local Vite example and local plain-static seed/final templates that were not copied wholesale into this repo.

This page captures the reusable guidance so the wiki can point at a repo-scoped reference instead of an external path.

## Two valid patterns

Both of these are good local patterns for permaweb apps:

- plain static HTML/CSS/JS builds
- Vite builds that emit a static `dist/`

The key rule is not the framework. The key rule is that the final output must be publishable as static files with manifest-safe relative paths.

## Plain static pattern

The lite-seed templates show the simplest durable setup:

- keep `index.html` and `styles.css` as first-class files
- bundle browser JS into `dist/` with `esbuild`
- copy `public/` straight into `dist/`
- keep output filenames and folder layout simple enough for agents to inspect

Typical build shape:

- copy `index.html`
- copy `styles.css`
- copy `public/`
- bundle `src/main.js` to `dist/app.js`
- emit code-split chunks under `dist/chunks/`

This is a strong default when:

- the app is mostly static
- direct file editability matters
- you want the least moving build machinery
- agent comprehension is more important than framework ergonomics

## Vite static pattern

The local Vite app shows that richer frontends can still deploy cleanly if they are configured for relative output.

Important Vite-side rules:

- set `base: './'`
- build into `dist/`
- keep output static and gateway-resolvable
- avoid assuming the app will always live at `/`
- use relative asset references in the built app

Useful local practices from that app:

- add a runtime `<base>` element in `index.html` so nested gateway paths still resolve correctly
- keep `favicon`, `manifest`, and other head assets relative
- if browser packages pull in Node APIs, polyfill them deliberately instead of hoping the bundler guesses right

This is a good fit when:

- the app uses React, TypeScript, or a heavier component stack
- you need Vite dev/build ergonomics
- you still want a final output that behaves like a plain static site after build

## Shared deploy invariants

Both patterns should end with:

- a complete `dist/` directory
- root-relative or current-directory-relative asset resolution
- no hidden runtime server dependency
- a source archive that includes the real app source, not just the built output
- a manifest that points at every published file

## Practical rule

- Use plain static builds for seed apps, simpler UIs, and repos optimized for direct agent editing.
- Use Vite when the app needs a modern frontend toolchain, but keep the output discipline of a static app.
