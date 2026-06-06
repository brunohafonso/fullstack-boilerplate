# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo Structure

npm workspaces monorepo with two apps:
- `apps/api` — Express 5 REST API (Node.js 24+, TypeScript 6, Prisma 7, SQLite) → see `apps/api/CLAUDE.md`
- `apps/web` — React 19 + Vite 8 SPA (TypeScript 6, Tailwind CSS v4, TanStack Query) → see `apps/web/CLAUDE.md`

## Commits

Conventional Commits enforced via commitlint + husky. Format: `type(scope): description`.
Lint-staged runs ESLint and related unit tests on staged files before each commit.
