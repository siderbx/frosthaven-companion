# Devlog

Running log of work on this project: what's done, what's in progress, and what's next.

## Done

- **2026-07-19** Scaffolded the Frosthaven companion app: React + Vite (TS) frontend, Hono-based Worker API at `worker/index.ts`, wired together with `@cloudflare/vite-plugin`. Single Worker deploys both static assets and API (`/api/*` routed to the Worker, everything else SPA fallback).
- **2026-07-19** `git init`'d the repo on `main`, initial commit made.
- **2026-07-19** Created GitHub repo [siderbx/frosthaven-companion](https://github.com/siderbx/frosthaven-companion) via `gh`, pushed initial commit. Later switched from private to **public** at user's request.
- **2026-07-19** Connected Cloudflare Workers Builds (native Git integration) in the dashboard. Verified live and working: https://frosthaven-companion.mcarlton.workers.dev/ serves the SPA and `/api/health` responds `{"status":"ok"}` from the Worker. Full pipeline confirmed: push to `main` → Workers Builds → auto-deploy.
- **2026-07-19** Repo switched to **public** at user's request (`gh repo edit --visibility public`).
- **2026-07-19** Shipped the first real feature: a single-character companion for the **Human Voidwarden (Jaws of the Lion)**, tailored to the user's current game. Four tabs:
  - **Character** — editable name, level/XP/gold counters, current/max HP with a visual bar. Replaces the cardboard character card.
  - **Perks** — freeform checklist the user populates from their physical perk sheet; check off as taken.
  - **Modifier Deck** — simulates the standard 20-card base attack modifier deck (draw/discard, auto-reshuffle on the crit/miss cards), plus a "Customize deck" editor so perk-driven deck changes (remove a −1, add a +1, etc.) can be reflected.
  - **Action Cards** — user enters their 11 Voidwarden cards once (name/initiative/top/bottom/tags/loss flags); tracks hand/used/lost status through short/long rests, computes round initiative as the min of the two played cards (per the standard rule), and suggests pairings by tag complementarity.
  - All state persists to `localStorage` so it survives reloads on the iPad.
  - Pushed via the pipeline and confirmed live: deployed JS bundle at https://frosthaven-companion.mcarlton.workers.dev/ contains the new UI (verified via curl, not just a guess), `/api/health` still responds correctly.
- **2026-07-19** User supplied a photo of the physical Voidwarden character mat, confirming HP by level (1–9: 6/7/8/9/10/11/12/13/14) and hand size 11. Added `src/data/voidwarden.ts` with this verified table and wired **Max HP to auto-fill from Level** in the Character tab (still manually overridable for items/effects that boost it). When leveling up: if the character was at full HP, they stay full at the new max; otherwise current HP just gets clamped to the new max, matching how the physical mat is used. Tested both cases in-browser before shipping.

## In Progress

_(nothing yet)_

## Todo

- Decide on real-time party-state architecture if/when this needs to sync across multiple players' devices — likely a Durable Object per campaign/session, deferred since the current scope is single-character/single-device.
- Consider wiring Perks directly into Modifier Deck composition (currently two separate manual steps) once the perk list/deck-effects are entered once and stabilize.
- Broaden beyond the Voidwarden to other classes/characters if the group wants it on more than one device.

## Notes / Decisions

- Chose **Workers** (not Pages) as the deploy target because Durable Objects (needed for real-time multiplayer state later) aren't available on Pages, and Cloudflare's native Git integration (Workers Builds) now supports Workers directly, not just Pages, so there's no tradeoff.
- Used `@cloudflare/vite-plugin` for a single-Worker full-stack setup (frontend assets + API in one deploy) rather than React Router framework mode, keeping the stack simpler for now.
- `npm create cloudflare@latest` (C3)'s interactive prompts hung non-interactively even with `--accept-defaults`/`CI=true` (variant-selection step doesn't respect flags in v2.70.12) — worked around by scaffolding with plain `npm create vite@latest` and manually wiring in `@cloudflare/vite-plugin`, `wrangler`, and `hono`.
- **Perk list, action card text/initiative, and HP-by-level are intentionally left for the user to enter**, not hardcoded from research — couldn't reliably verify Cephalofair's exact numbers/wording from available sources, and didn't want to either assert wrong game data as fact or reproduce their proprietary card text into a public repo. The user's physical components are the authoritative source anyway.
- Found and fixed a real stale-closure bug during testing: rapid-fire clicks on the deck draw button (simulated via browser automation faster than any human tap) could drop draws because `onChange(computeNext(state))` closed over a stale `state`. Fixed by switching all list/deck mutations (`ModifierDeck`, `PerkList`, `ActionCards`) to functional `setState` updates (`onChange(prev => ...)`) so each update reads the latest state regardless of dispatch timing.
