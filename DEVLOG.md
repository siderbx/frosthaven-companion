# Devlog

Running log of work on this project: what's done, what's in progress, and what's next.

## Done

- **2026-07-19** Scaffolded the Frosthaven companion app: React + Vite (TS) frontend, Hono-based Worker API at `worker/index.ts`, wired together with `@cloudflare/vite-plugin`. Single Worker deploys both static assets and API (`/api/*` routed to the Worker, everything else SPA fallback).
- **2026-07-19** `git init`'d the repo on `main`, initial commit made.
- **2026-07-19** Created GitHub repo [siderbx/frosthaven-companion](https://github.com/siderbx/frosthaven-companion) via `gh`, pushed initial commit. Later switched from private to **public** at user's request.
- **2026-07-19** Connected Cloudflare Workers Builds (native Git integration) in the dashboard. Verified live and working: https://frosthaven-companion.mcarlton.workers.dev/ serves the SPA and `/api/health` responds `{"status":"ok"}` from the Worker. Full pipeline confirmed: push to `main` → Workers Builds → auto-deploy.

## In Progress

_(nothing yet)_

## Todo

- Finish connecting Workers Builds (above) and verify the first auto-deploy works.
- Decide on real-time party-state architecture — likely a Durable Object per campaign/session for shared state (character health, initiative order, loot deck) synced across players' devices via WebSockets.
- Design the actual companion app features (character sheets, scenario tracker, monster stat cards, etc.) — nothing built yet beyond the Vite starter page.

## Notes / Decisions

- Chose **Workers** (not Pages) as the deploy target because Durable Objects (needed for real-time multiplayer state later) aren't available on Pages, and Cloudflare's native Git integration (Workers Builds) now supports Workers directly, not just Pages, so there's no tradeoff.
- Used `@cloudflare/vite-plugin` for a single-Worker full-stack setup (frontend assets + API in one deploy) rather than React Router framework mode, keeping the stack simpler for now.
- `npm create cloudflare@latest` (C3)'s interactive prompts hung non-interactively even with `--accept-defaults`/`CI=true` (variant-selection step doesn't respect flags in v2.70.12) — worked around by scaffolding with plain `npm create vite@latest` and manually wiring in `@cloudflare/vite-plugin`, `wrangler`, and `hono`.
- Repo created as **private** by default; flip to public in GitHub settings if that's wanted.
