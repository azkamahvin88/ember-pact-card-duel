# 🔥 EMBER PACT — a duel of cards

[![make.fun](https://make.fun/badge.svg)](https://make.fun/bounty/best-card-game-20261122-1826)

**EMBER PACT** is an original turn-based card duel built for the
[make.fun](https://make.fun) competition **best-card-game-20261122-1826**.
Two duelists, thirty life each, four elements — and one pact that only one
of them walks away from.

## How to play

- **Goal:** bring Pyra, the Ember Warden, to 0 life before she does the same to you.
- **Mana** starts at 1 and grows +1 each round (max 10). Cards cost mana.
- **Elements:** Ember beats Gale, Gale beats Stone, Stone beats Aqua, Aqua beats
  Ember. An attack whose element beats the enemy **guard** (the element of the
  last card they played) deals **+3 damage**.
- **Card kinds:** Strike (damage), Surge (damage, +3 on advantage), Heal
  (restore life), Guard (gain shield), Draw (damage + draw a card).
- **Turn:** draw 1 card, play cards from your hand, then End Turn. Pyra plays
  a real heuristic AI — she takes lethal lines, heals when hurt, and guards
  when her life is low.
- **Fatigue:** drawing from an empty deck deals 2 damage to you.
- **Controls:** mouse (click a card, then click its target) or keyboard
  (1–7 select, Enter play, Space end turn, N new duel, Esc deselect).

## Run it

No build step, no network, no dependencies — the game is static files.

```sh
# Serve the game locally (Node 22+)
node serve.ts
# then open http://localhost:8080/ in a desktop browser

# Or open the file directly:
#   game/index.html
```

## Screenshots

Rendered from the game itself (Playwright + headless Chromium):

1. `1-title.png` — title screen
2. `2-play.png` — mid-duel table, both hands, life totals, a card selected
3. `3-win.png` — victory screen
4. `4-loss.png` — defeat screen

## Entry program

`main.ts` (Node, stdlib only) copies `game/` and `screenshots/` into the
output directory (`$MAKEFUN_OUTPUT_DIR`, default `/output`) and writes
`dossier.json` with the kit's `buildDossier` from `vendor/makefun-game.ts`.
The build is fully deterministic — two runs produce byte-identical output.

```sh
MAKEFUN_OUTPUT_DIR=/tmp/ember-out node main.ts
```

## Files

- `game/index.html` — the table (loads `style.css` + `src/*.js`)
- `game/style.css` — tavern visuals, card faces
- `game/src/rng.js` — seeded PRNG (mulberry32) + shuffle
- `game/src/cards.js` — the 13-card pool, elements, advantage wheel
- `game/src/ai.js` — Pyra's heuristic (lethal first, defend when low)
- `game/src/render.js` — DOM rendering of the table
- `game/src/input.js` — mouse + keyboard controls
- `game/src/shots.js` — scripted states for the four screenshots
- `game/src/main.js` — game state, turn flow, win/lose
- `vendor/makefun-game.ts` — make.fun dossier library (copied from the kit, unchanged)
- `main.ts` — entry program · `serve.ts` — local test server

## License

MIT — see [LICENSE](LICENSE).
