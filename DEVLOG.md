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
- **2026-07-19** User supplied a photo of the physical Voidwarden character mat, confirming HP by level (1–9: 6/7/8/9/10/11/12/13/14), hand size 11, and XP thresholds (45/95/150/210/275/345/420/500). Added `src/data/voidwarden.ts` with this verified table and wired **Max HP to auto-fill from Level** in the Character tab (still manually overridable for items/effects that boost it). When leveling up: if the character was at full HP, they stay full at the new max; otherwise current HP just gets clamped to the new max, matching how the physical mat is used. Tested both cases in-browser before shipping. Also added an **XP-to-next-level hint** on the Experience counter using the verified thresholds.
- **2026-07-19** User clarified the real JOTL leveling mechanic (core Gloomhaven-style: pick one new card per level-up), correcting an earlier wrong assumption (drawn from the card site's "Build Mode," which doesn't actually enforce unlock gating). Investigated gloomhavencards.com's card art directly (zoomed into each of the 14 Voidwarden card images) and found a crown icon on every card: **11 cards marked "1"** (the full starting hand — matches hand size exactly, no choice needed) and **3 cards marked "X"** (Cold Embrace, Resigned Frenzy, Sap Warmth — the level-up bonus pool). Couldn't verify the exact level each "X" card unlocks at (not printed as a number, and no reliable secondary source), so rather than guess:
  - Added a **`reserve`** status to `ActionCardStatus` (`reserve | hand | used | lost`) representing "owned but not in active hand."
  - Seeded all 14 cards in `src/data/voidwarden.ts` (`buildVoidwardenActionCards`) — the 11 starting cards go straight to Hand, the 3 X-cards start in Reserve.
  - Added **Reserve ↔ Hand** swap buttons in the Action Cards tab so the user moves each X-card over whenever their rulebook/level-up confirms they've unlocked it — sidesteps the unverified exact-level question entirely while staying mechanically accurate.
  - Card names + initiative values are pre-filled (verified from the card art); top/bottom ability text is left blank for the user to paraphrase themselves — deliberately not transcribing Cephalofair's exact card wording into the public repo (see prior note on this).
  - Seeded the **Perks** tab from the user's photographed perk sheet (`src/data/voidwardenPerks.ts`), expanding repeatable perks (e.g. "Replace one +0 card..." ×3) into individual checkbox rows to match the physical sheet.
  - Verified all of this in-browser (JS-dispatched clicks, since the browser automation's synthetic click occasionally no-ops — confirmed via console that it's a tooling quirk, not an app bug) before shipping.
- **2026-07-19** **Correction from the user**: the above entry's "3 X-cards are gained via level-up" framing was wrong. All 14 cards — both "1" and "X" crown — are available from level 1; there's no per-level card unlocking in JOTL at all. The "1"/"X" distinction on the card art means something else (not determined). Fixed:
  - `buildVoidwardenActionCards()` now gives every card `level: 1` (previously the 3 Reserve cards had a placeholder `level: 0`).
  - Reserve section copy changed from "Cards you've unlocked but haven't chosen..." to "All 14 cards are available from level 1 — these are just the ones not currently in your hand of 11."
  - The Reserve/Hand split itself didn't need to change — it's still mechanically correct (hand size 11 < pool 14 means *some* split is always needed), it just isn't gated by level; the default split is an arbitrary starting point, freely rearrangeable via the swap buttons.

## In Progress

_(nothing yet)_

## Todo

- Fill in top/bottom action text for all 14 cards from the physical cards (currently blank by design).
- Decide on real-time party-state architecture if/when this needs to sync across multiple players' devices — likely a Durable Object per campaign/session, deferred since the current scope is single-character/single-device.
- Consider wiring Perks directly into Modifier Deck composition (currently two separate manual steps) once the perk list/deck-effects are entered once and stabilize.
- Broaden beyond the Voidwarden to other classes/characters if the group wants it on more than one device.

## Notes / Decisions

- Chose **Workers** (not Pages) as the deploy target because Durable Objects (needed for real-time multiplayer state later) aren't available on Pages, and Cloudflare's native Git integration (Workers Builds) now supports Workers directly, not just Pages, so there's no tradeoff.
- Used `@cloudflare/vite-plugin` for a single-Worker full-stack setup (frontend assets + API in one deploy) rather than React Router framework mode, keeping the stack simpler for now.
- `npm create cloudflare@latest` (C3)'s interactive prompts hung non-interactively even with `--accept-defaults`/`CI=true` (variant-selection step doesn't respect flags in v2.70.12) — worked around by scaffolding with plain `npm create vite@latest` and manually wiring in `@cloudflare/vite-plugin`, `wrangler`, and `hono`.
- **Perk list, action card text/initiative, and HP-by-level are intentionally left for the user to enter**, not hardcoded from research — couldn't reliably verify Cephalofair's exact numbers/wording from available sources, and didn't want to either assert wrong game data as fact or reproduce their proprietary card text into a public repo. The user's physical components are the authoritative source anyway.
- Found and fixed a real stale-closure bug during testing: rapid-fire clicks on the deck draw button (simulated via browser automation faster than any human tap) could drop draws because `onChange(computeNext(state))` closed over a stale `state`. Fixed by switching all list/deck mutations (`ModifierDeck`, `PerkList`, `ActionCards`) to functional `setState` updates (`onChange(prev => ...)`) so each update reads the latest state regardless of dispatch timing.
