# 1. Use Turborepo for Monorepo Management

Date: 2026-07-13

## Status
Accepted

## Context
As we scale ContentKit AI Pro, we need a way to manage multiple applications (client, server) and shared packages (config, ui, types) efficiently. A monorepo approach allows us to share code easily, enforce consistent tooling across all projects, and simplify dependency management. We evaluated several tools including Nx, Lerna, and Turborepo.

## Decision
We will use **Turborepo** as our monorepo build system, orchestrated with npm workspaces.

## Consequences
- **Positive:** Extremely fast builds due to local and remote caching. Simple configuration via `turbo.json`. Easy integration with Vercel for deployment.
- **Negative:** Requires team members to understand workspace dependency linking (e.g. `workspace:*`).
