# Repository Guidelines

## Project Structure & Module Organization

This is a pnpm workspace for Eventernote tooling. Source lives under `packages/*/src`, with package-specific tests under `packages/*/tests`.

- `packages/eventernote-core`: shared SDK for URL building, fetching, parsing, schemas, SQLite persistence, lookup services, and preference helpers.
- `packages/eventernote-cli`: `eventernote` CLI implementation and Markdown/JSON rendering.
- `packages/eventernote-mcp`: stdio MCP server exposing typed Eventernote tools.
- `packages/eventernote-skill`: Codex Skill wrapper, `SKILL.md`, CLI wrapper, and reference docs.
- `docs/superpowers`: product specs and implementation plans.

Keep core scraping, parsing, and database logic in `eventernote-core`; expose it through CLI/MCP/Skill adapters rather than duplicating behavior.

## Build, Test, and Development Commands

```bash
pnpm install        # install workspace dependencies
pnpm build          # build all packages with tsup
pnpm test           # run Vitest tests
pnpm typecheck      # run package type checks
pnpm lint           # current package lint/type validation
pnpm format         # format with Prettier
```

Useful local checks:

```bash
pnpm --filter @cknl/eventernote-skill smoke
pnpm --filter @cknl/eventernote-cli exec eventernote --help
```

## Coding Style & Naming Conventions

Use TypeScript ESM (`type: "module"`) and strict typing. Prefer small, named functions and explicit exported types from `eventernote-core`. File names are kebab-case for modules such as `event-card.ts`; test files use `*.test.ts`. Use two-space indentation and run `pnpm format` before submitting broad edits.

## Testing Guidelines

Tests use Vitest. Add parser fixtures under `packages/eventernote-core/tests/fixtures` when Eventernote HTML parsing changes. New SDK behavior should include focused tests near the affected package, for example `packages/eventernote-core/tests/parsers.test.ts` or `packages/eventernote-mcp/tests/tool-schemas.test.ts`.

## Commit & Pull Request Guidelines

This repository currently has no commit history to infer conventions from. Use concise Conventional Commit-style subjects, such as `docs: add contributor guide` or `fix: parse event detail links`. PRs should describe the change, list verification commands, note any unimplemented scope, and link related specs or issues when available.

## Security & Configuration Tips

Set `EVENTERNOTE_DB` for preference commands that need SQLite storage. Do not commit local databases, credentials, cookies, or browser session data. Eventernote account-modifying actions, ticket purchases, form submissions, and calendar writes are out of scope.

## Agent-Specific Instructions

Follow the repository instruction in `/Users/ch3cknull/.codex/RTK.md`: prefix shell commands with `rtk` when working here. Respect existing uncommitted changes; do not revert user edits unless explicitly asked.
