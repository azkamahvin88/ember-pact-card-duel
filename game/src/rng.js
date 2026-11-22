/* rng.js — deterministic random numbers for EMBER PACT.
 * Every shuffle and every AI tie-break comes from one seeded generator,
 * so a game with the same seed always plays out the same way.
 * No Date.now(), no Math.random() anywhere in the game logic. */

'use strict';

/** mulberry32: a small, fast seeded PRNG. Returns a function yielding [0, 1). */
function makeRng(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher–Yates shuffle driven by the seeded rng. Returns a new array. */
function shuffleDeck(deck, rng) {
  const out = deck.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

/** Pick one element of an array with the seeded rng (uniform). */
function pickOne(list, rng) {
  return list[Math.floor(rng() * list.length)];
}

/** Integer in [min, max] from the seeded rng. */
function rollInt(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}
