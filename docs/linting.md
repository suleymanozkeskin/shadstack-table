# Lint rules

## Tools

- Oxlint and `@oxlint/plugins`: `1.83.0`.
- `@shadcn/lint`: `0.1.0`.
- Generic anti-slop rules: copied into `tools/oxlint/anti-slop/` from commit `c44ef22ca116d0ba62a3ff663a0bd13a3f3fa40b`.
- Source and license details: [UPSTREAM.md](../tools/oxlint/anti-slop/UPSTREAM.md).

All 18 generic anti-slop rules are errors. The Effect plugin is not enabled because this repository has no direct Effect dependency. Runtime `typeof` checks are allowed in type guards. Guards check values at external input boundaries.

The seven-day package cooldown remains in `bunfig.toml`. Its exceptions include the new lint packages and Oxlint platform bindings. Existing TanStack exceptions remain.

## Button contract

`shadcn/no-restyle` checks `Button` imports from `_ui/button`. Callers can use full width, margins, `shrink-0`, and `pointer-events-auto`. Button shape, internal spacing, colors, and typography belong in the component variants.

```tsx
<Button size="icon-sm" purpose="column-action" variant="ghost" />
<Button className="w-full mt-2" size="action">Save</Button>
```

Add a shared variant in `packages/shadstack-table/src/_ui/button.tsx` when a new use needs different component styles. Contract errors point to that file and list the relevant props. Component definition files can set their own styles.

The first contract covers Button. Other components have no contract yet. Static analysis does not prove runtime class strings, external CSS, inline styles, or visual appearance. Keep browser checks for those cases.

## Commands

```sh
bun run lint
bun run test:lint
bun run typecheck
bun run test
bun run verify:package
bun run test:e2e
```

`test:lint` checks an allowed Button class, a rejected Button restyle, and a rejected chained assertion. `verify:package` checks generated declarations, exports, package contents, and size limits.

For automatic fixes:

```sh
bun run lint:fix
bun run format
```

Run both commands again after the first pass. The second pass must leave files unchanged. The copied plugin and local agent directories are excluded from lint and formatting.

Keep licenses and tree-shaking annotations in built JavaScript. JSDoc stays in declarations and source maps. The JavaScript output omits JSDoc to avoid shipping duplicate API documentation.

## Review limits

A clean lint result does not prove that all public types are sound. Check generic inference against the generated declarations. Check runtime behavior for state, refs, editing, and virtualization.

React Doctor also reports broad complexity and architecture findings. Its ref-in-render check flags the table facade's conditional first initialization. React permits [predictable ref initialization](https://react.dev/reference/react/useRef#avoiding-recreating-the-ref-contents). This exception does not permit DOM ref reads during render or establish full React Compiler compatibility.
