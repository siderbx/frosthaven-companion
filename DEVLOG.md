# Devlog

Running log of work on this project: what's done, what's in progress, and what's next.

## Done

- **2026-07-19** Scaffolded the Frosthaven companion app: React + Vite (TS) frontend, Hono-based Worker API at `worker/index.ts`, wired together with `@cloudflare/vite-plugin`. Single Worker deploys both static assets and API (`/api/*` routed to the Worker, everything else SPA fallback).
- **2026-07-19** `git init`'d the repo on `main`, initial commit made.
- **2026-07-19** Created GitHub repo [siderbx/frosthaven-companion](https://github.com/siderbx/frosthaven-companion) (private) via `gh`, pushed initial commit.

## In Progress

- Connecting Cloudflare Workers Builds (native Git integration) to the GitHub repo — this last step needs to happen in the Cloudflare dashboard directly, since it requires an OAuth/GitHub App grant only the account owner can approve. Steps:
  1. Go to the [Cloudflare dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Import a repository**.
  2. Connect your GitHub account/org if not already connected, and authorize the Cloudflare Workers & Pages GitHub App for the `frosthaven-companion` repo.
  3. Select the repo, branch `main`.
  4. Build settings:
     - Build command: `npm run build`
     - Deploy command: `npx wrangler deploy`
     - Root directory: `/` (repo root)
  5. Confirm the Worker name in the dashboard matches `"name": "frosthaven-companion"` in `wrangler.jsonc` (must match exactly or the build fails).
  6. Save — this triggers the first build/deploy, and every push to `main` after that auto-deploys.

## Todo

- Finish connecting Workers Builds (above) and verify the first auto-deploy works.
- Decide on real-time party-state architecture — likely a Durable Object per campaign/session for shared state (character health, initiative order, loot deck) synced across players' devices via WebSockets.
- Design the actual companion app features (character sheets, scenario tracker, monster stat cards, etc.) — nothing built yet beyond the Vite starter page.

## Notes / Decisions

- Chose **Workers** (not Pages) as the deploy target because Durable Objects (needed for real-time multiplayer state later) aren't available on Pages, and Cloudflare's native Git integration (Workers Builds) now supports Workers directly, not just Pages, so there's no tradeoff.
- Used `@cloudflare/vite-plugin` for a single-Worker full-stack setup (frontend assets + API in one deploy) rather than React Router framework mode, keeping the stack simpler for now.
- `npm create cloudflare@latest` (C3)'s interactive prompts hung non-interactively even with `--accept-defaults`/`CI=true` (variant-selection step doesn't respect flags in v2.70.12) — worked around by scaffolding with plain `npm create vite@latest` and manually wiring in `@cloudflare/vite-plugin`, `wrangler`, and `hono`.
- Repo created as **private** by default; flip to public in GitHub settings if that's wanted.
