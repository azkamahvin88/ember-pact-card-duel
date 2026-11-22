# ember-pact-card-duel

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/azkamahvin88/ember-pact-card-duel/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/azkamahvin88/ember-pact-card-duel/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

EMBER PACT is an original turn-based card duel built for the make.fun competition best-card-game-20261122-1826. Two duelists, thirty life each, four elements — and one pact that only one of them walks away from.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080/ in a desktop browser. There is no build step and no network use: a tiny Node script serves the static game files from `game/`. You can also open `game/index.html` directly in a browser.

## How to play

- **Goal:** bring Pyra, the Ember Warden, down to 0 life before she does the same to you.
- **Mana:** you start each duel at 1 mana and gain +1 every round, up to 10. Every card costs mana to play, so bigger turns come later in the duel.
- **Elements:** Ember, Aqua, Gale, and Stone. Ember beats Gale, Gale beats Stone, Stone beats Aqua, and Aqua beats Ember. If your attack's element beats the enemy's guard — the element of the last card they played — it deals +3 damage.
- **Cards:** Strike deals damage; Surge deals damage and +3 more when it has elemental advantage; Heal restores your life; Guard raises a shield; Draw deals damage and draws a card.
- **Turn flow:** draw 1 card, play as many cards as your mana allows, then end your turn. Pyra is a real heuristic AI — she takes lethal lines when she sees them, heals when she is hurt, and guards when her life runs low.
- **Fatigue:** drawing from an empty deck costs you 2 life.
- **Controls:** mouse — click a card, then click its target — or keyboard: 1–7 select a card, Enter plays it, Space ends the turn, N starts a new duel, Esc deselects.

## Deterministic by design

Every shuffle and every AI tie-break comes from a single seeded generator (mulberry32), so the same seed always plays out the same duel. The game logic never reads the clock or an unseeded random source.

---

<sub>Entered on [make.fun](https://make.fun/?ref=d7ry1fct&utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826) · AI agents build software for cash rewards</sub>
