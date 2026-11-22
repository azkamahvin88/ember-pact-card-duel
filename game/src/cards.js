/* cards.js — the card pool, the four elements and the advantage wheel.
 * EMBER PACT is an original duel: no cloned game, no real-world card names.
 * Each card is one plain object: id, name, element, cost, attack, kind, value.
 * kind: 'strike' (damage), 'surge' (damage + bonus on advantage),
 *       'heal' (restore own life), 'guard' (gain shield), 'draw' (damage + draw a card).
 */

'use strict';

/** The four elements, in wheel order. */
const ELEMENTS = ['ember', 'aqua', 'gale', 'stone'];

/** Element symbols shown on cards and guard badges. */
const ELEMENT_ICON = {
  ember: '🔥',
  aqua: '💧',
  gale: '🌪️',
  stone: '🪨',
};

/** Element display names. */
const ELEMENT_NAME = {
  ember: 'Ember',
  aqua: 'Aqua',
  gale: 'Gale',
  stone: 'Stone',
};

/** Which element each element beats: Ember > Gale > Stone > Aqua > Ember. */
const BEATS = {
  ember: 'gale',
  gale: 'stone',
  stone: 'aqua',
  aqua: 'ember',
};

/** Bonus damage when the attacker's element beats the defender's guard. */
const ADVANTAGE_BONUS = 3;

/** True when attackElement beats guardElement (guard null = no advantage). */
function hasAdvantage(attackElement, guardElement) {
  return guardElement !== null && BEATS[attackElement] === guardElement;
}

/** The 13 unique cards of the Pact. A deck holds 2 copies of each (26 cards). */
const CARD_DEFS = [
  { id: 'ember-spark',   name: 'Ember Spark',   element: 'ember', cost: 1, attack: 2, kind: 'strike', value: 0, text: 'Deal 2 damage.' },
  { id: 'gale-dart',     name: 'Gale Dart',     element: 'gale',  cost: 1, attack: 2, kind: 'strike', value: 0, text: 'Deal 2 damage.' },
  { id: 'cinder-fang',   name: 'Cinder Fang',   element: 'ember', cost: 2, attack: 4, kind: 'strike', value: 0, text: 'Deal 4 damage.' },
  { id: 'tide-lash',     name: 'Tide Lash',     element: 'aqua',  cost: 2, attack: 3, kind: 'draw',   value: 0, text: 'Deal 3 damage. Draw a card.' },
  { id: 'aqua-mend',     name: 'Aqua Mend',     element: 'aqua',  cost: 2, attack: 0, kind: 'heal',   value: 6, text: 'Restore 6 life.' },
  { id: 'stone-wall',    name: 'Stone Wall',    element: 'stone', cost: 2, attack: 0, kind: 'guard',  value: 6, text: 'Gain 6 shield.' },
  { id: 'flame-pact',    name: 'Flame Pact',    element: 'ember', cost: 3, attack: 5, kind: 'surge',  value: 0, text: 'Deal 5 damage. +3 on advantage.' },
  { id: 'storm-gust',    name: 'Storm Gust',    element: 'gale',  cost: 3, attack: 4, kind: 'surge',  value: 0, text: 'Deal 4 damage. +3 on advantage.' },
  { id: 'boulder-slam',  name: 'Boulder Slam',  element: 'stone', cost: 3, attack: 5, kind: 'strike', value: 0, text: 'Deal 5 damage.' },
  { id: 'deep-current',  name: 'Deep Current',  element: 'aqua',  cost: 4, attack: 6, kind: 'strike', value: 0, text: 'Deal 6 damage.' },
  { id: 'sky-rend',      name: 'Sky Rend',      element: 'gale',  cost: 4, attack: 7, kind: 'strike', value: 0, text: 'Deal 7 damage.' },
  { id: 'mountain-heart',name: 'Mountain Heart',element: 'stone', cost: 4, attack: 0, kind: 'heal',   value: 8, text: 'Restore 8 life.' },
  { id: 'inferno-roar',  name: 'Inferno Roar',  element: 'ember', cost: 5, attack: 8, kind: 'strike', value: 0, text: 'Deal 8 damage.' },
];

/** Look a card definition up by id. */
function cardDef(id) {
  return CARD_DEFS.find((c) => c.id === id);
}

/** Build a fresh 26-card deck (2 copies of each card) and shuffle it with the seeded rng. */
function buildDeck(rng) {
  const deck = [];
  for (const def of CARD_DEFS) {
    deck.push(def.id);
    deck.push(def.id);
  }
  return shuffleDeck(deck, rng);
}

/** Damage a strike/surge/draw card deals before shield, given the defender's guard. */
function cardDamage(def, defenderGuard) {
  let dmg = def.attack;
  if (def.kind === 'surge' && hasAdvantage(def.element, defenderGuard)) {
    dmg += ADVANTAGE_BONUS;
  }
  return dmg;
}

/** Human-readable target hint for a card kind. */
function cardTargetHint(def) {
  if (def.kind === 'heal' || def.kind === 'guard') return 'Play on yourself';
  return 'Play on the enemy';
}
