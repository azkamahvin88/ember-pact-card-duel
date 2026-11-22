/* ai.js — the enemy duelist's brain (Pyra, the Ember Warden).
 * A real heuristic, not a random player: it scores every card it can afford,
 * takes a lethal line when one exists, defends when its life is low, and
 * otherwise plays the best value it can. Ties break with the seeded rng,
 * so the AI is deterministic for a given game seed.
 */

'use strict';

/**
 * Score one playable card for `side` in the current state.
 * Higher is better. Lethal damage scores far above everything else.
 */
function scoreCard(state, side, handIndex, rng) {
  const me = state[side];
  const foe = state[side === 'player' ? 'ai' : 'player'];
  const def = cardDef(me.hand[handIndex]);
  if (!def || def.cost > me.mana) return -Infinity;

  let score = 0;
  if (def.kind === 'strike' || def.kind === 'surge' || def.kind === 'draw') {
    const dmg = cardDamage(def, foe.guard);
    const throughShield = Math.max(0, dmg - foe.shield);
    // Lethal: win the game right now.
    if (throughShield >= foe.life) score += 1000;
    score += dmg * 10;
    // Advantage play is worth more than raw damage alone.
    if (def.kind === 'surge' && hasAdvantage(def.element, foe.guard)) score += 15;
    // Drawing keeps the hand full for later turns.
    if (def.kind === 'draw') score += 12;
    // Do not waste a big hit on a shielded foe when a small one clears it.
    if (foe.shield > 0 && dmg <= foe.shield) score -= 8;
  } else if (def.kind === 'heal') {
    const missing = me.maxLife - me.life;
    if (missing <= 0) return -Infinity; // full life: healing is wasted
    score += Math.min(def.value, missing) * 8;
    if (me.life <= 10) score += 40; // desperate: heal first
  } else if (def.kind === 'guard') {
    if (me.life <= 12) score += def.value * 9 + 30;
    else if (foe.life <= 8) score -= 20; // nearly won: do not turtle
    else score += def.value * 4;
  }
  // Prefer efficient cards: same effect for less mana wins.
  score += (10 - def.cost) * 1.5;
  // Tiny seeded jitter so equal cards do not always pick the same slot.
  score += rng() * 0.5;
  return score;
}

/**
 * Pick the best card index the AI can afford right now, or -1 when it should
 * stop (nothing playable, or nothing worth playing).
 */
function pickBestCard(state, side, rng) {
  const me = state[side];
  let bestIndex = -1;
  let bestScore = 0; // a card must be worth at least this much to play
  for (let i = 0; i < me.hand.length; i++) {
    const s = scoreCard(state, side, i, rng);
    if (s > bestScore) {
      bestScore = s;
      bestIndex = i;
    }
  }
  return bestIndex;
}

/** True when the AI has any card it can afford this turn. */
function aiHasPlay(state, side) {
  const me = state[side];
  return me.hand.some((id) => cardDef(id).cost <= me.mana);
}
