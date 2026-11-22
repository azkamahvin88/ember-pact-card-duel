/* main.js — EMBER PACT game state and turn flow.
 * Two duelists start at 30 life. Mana starts at 1 and grows +1 each round
 * (max 10). Each turn a duelist draws 1 card, then plays cards from hand.
 * A played card's element becomes that duelist's guard: attacks whose
 * element beats the guard deal +3. Life at 0 loses. An empty deck bites
 * back: drawing with no cards left deals 2 fatigue damage.
 */

'use strict';

const START_LIFE = 30;
const MAX_HAND = 7;
const MAX_MANA = 10;
const FATIGUE_DAMAGE = 2;
const GAME_SEED = 20261122;
const AI_THINK_MS = 650;
const AI_PLAY_MS = 750;

/** The live game state (also exposed as window.__game for testing). */
let game = null;

/** One fresh duelist: life, mana, shield, guard element, deck, hand, discard. */
function newDuelist(rng) {
  return {
    life: START_LIFE,
    maxLife: START_LIFE,
    mana: 1,
    maxMana: 1,
    shield: 0,
    guard: null,
    deck: buildDeck(rng),
    hand: [],
    discard: [],
  };
}

/**
 * Fair opener: a hand with no cheap attack cannot strike until round 3,
 * so swap its most expensive card with the cheapest attack left in the deck.
 * Deterministic (same seed, same swap) and applied to both duelists.
 */
function ensurePlayableOpener(duelist) {
  const hasCheapAttack = duelist.hand.some((id) => {
    const d = cardDef(id);
    return d.cost <= 2 && (d.kind === 'strike' || d.kind === 'surge' || d.kind === 'draw');
  });
  if (hasCheapAttack) return;
  let hi = 0;
  duelist.hand.forEach((id, i) => {
    if (cardDef(id).cost > cardDef(duelist.hand[hi]).cost) hi = i;
  });
  let lo = -1;
  duelist.deck.forEach((id, i) => {
    const d = cardDef(id);
    if (d.kind !== 'strike' && d.kind !== 'surge' && d.kind !== 'draw') return;
    if (lo < 0) {
      lo = i;
      return;
    }
    if (d.cost < cardDef(duelist.deck[lo]).cost) lo = i;
  });
  if (lo < 0) return;
  const tmp = duelist.hand[hi];
  duelist.hand[hi] = duelist.deck[lo];
  duelist.deck[lo] = tmp;
}

/** Deal the opening hands (3 cards each) with a fair opener for both sides. */
function dealOpeningHands(state) {
  for (let i = 0; i < 3; i++) {
    drawCard(state, 'player', true);
    drawCard(state, 'ai', true);
  }
  ensurePlayableOpener(state.player);
  ensurePlayableOpener(state.ai);
}

/** Start a brand-new duel with the fixed seed. */
function newGame() {
  const rng = makeRng(GAME_SEED);
  game = {
    phase: 'play',
    round: 1,
    active: 'player',
    selected: -1,
    winner: null,
    winReason: '',
    log: [],
    rng: rng,
    player: newDuelist(rng),
    ai: newDuelist(rng),
  };
  // Opening hands: 3 cards each.
  dealOpeningHands(game);
  game.player.maxMana = 1;
  game.player.mana = 1;
  game.ai.maxMana = 1;
  game.ai.mana = 1;
  addLog(game, 'The pact is sealed. You move first — spend your ember wisely.');
  renderGame();
  return game;
}

/** Show the title screen (fresh state behind it, ready to begin). */
function showTitle() {
  const rng = makeRng(GAME_SEED);
  game = {
    phase: 'title',
    round: 1,
    active: 'player',
    selected: -1,
    winner: null,
    winReason: '',
    log: ['Two duelists. One pact. Thirty life each.'],
    rng: rng,
    player: newDuelist(rng),
    ai: newDuelist(rng),
  };
  for (let i = 0; i < 3; i++) {
    drawCard(game, 'player', true);
    drawCard(game, 'ai', true);
  }
  ensurePlayableOpener(game.player);
  ensurePlayableOpener(game.ai);
  renderGame();
}

/** Append a line to the turn log (newest first, capped). */
function addLog(state, message) {
  state.log.unshift(message);
  if (state.log.length > 40) state.log.length = 40;
}

/** Draw one card for a duelist. Fatigue bites when the deck is empty. */
function drawCard(state, side, silent) {
  const me = state[side];
  if (me.deck.length === 0) {
    me.life -= FATIGUE_DAMAGE;
    if (!silent) {
      addLog(state, `${side === 'player' ? 'You' : 'Pyra'} draw from an empty deck and take ${FATIGUE_DAMAGE} fatigue damage.`);
    }
    checkEnd(state);
    return null;
  }
  const id = me.deck.pop();
  if (me.hand.length >= MAX_HAND) {
    me.discard.push(id);
    if (!silent) addLog(state, `${side === 'player' ? 'Your' : "Pyra's"} hand is full — ${cardDef(id).name} burns away.`);
    return null;
  }
  me.hand.push(id);
  return id;
}

/** Deal damage to a duelist: shield absorbs first, the rest hits life. */
function dealDamage(state, side, amount) {
  const me = state[side];
  const absorbed = Math.min(me.shield, amount);
  me.shield -= absorbed;
  const toLife = amount - absorbed;
  me.life -= toLife;
  return { absorbed: absorbed, toLife: toLife };
}

/** Begin a duelist's turn: refill mana, draw a card, announce it. */
function startTurn(state, side) {
  const me = state[side];
  me.maxMana = Math.min(MAX_MANA, state.round);
  me.mana = me.maxMana;
  state.active = side;
  state.selected = -1;
  drawCard(state, side, false);
  if (state.phase === 'play') {
    addLog(state, side === 'player'
      ? `Round ${state.round} — your turn. ${me.mana} mana, draw a card.`
      : `Round ${state.round} — Pyra's turn.`);
  }
  checkEnd(state);
}

/** End the game when a duelist hits 0 life. */
function checkEnd(state) {
  if (state.phase === 'over') return;
  if (state.ai.life <= 0) {
    state.phase = 'over';
    state.winner = 'player';
    state.winReason = 'Pyra’s life fell to zero. The ember is yours.';
    addLog(state, 'Victory! Pyra’s life fell to zero.');
  } else if (state.player.life <= 0) {
    state.phase = 'over';
    state.winner = 'ai';
    state.winReason = 'Your life fell to zero. Pyra keeps the ember… this time.';
    addLog(state, 'Defeat. Your life fell to zero.');
  }
}

/**
 * Play a card from a duelist's hand. Attacks hit the enemy, heal/guard help
 * the caster. The card's element becomes the caster's guard. Returns true
 * when the card was played.
 */
function playCard(state, side, handIndex) {
  if (state.phase !== 'play') return false;
  const me = state[side];
  const foe = state[side === 'player' ? 'ai' : 'player'];
  const def = cardDef(me.hand[handIndex]);
  if (!def || def.cost > me.mana) return false;

  me.hand.splice(handIndex, 1);
  me.discard.push(def.id);
  me.mana -= def.cost;
  me.guard = def.element;
  const who = side === 'player' ? 'You' : 'Pyra';

  if (def.kind === 'strike' || def.kind === 'surge' || def.kind === 'draw') {
    const dmg = cardDamage(def, foe.guard);
    const hit = dealDamage(state, side === 'player' ? 'ai' : 'player', dmg);
    const adv = def.kind === 'surge' && hasAdvantage(def.element, foe.guard) ? ' (element advantage +3!)' : '';
    addLog(state, `${who} play ${def.name}${adv} — ${dmg} damage` +
      (hit.absorbed > 0 ? `, ${hit.absorbed} soaked by shield` : '') +
      `. Pyra ${state.ai.life} ♥ · You ${state.player.life} ♥.`);
    if (def.kind === 'draw') drawCard(state, side, false);
  } else if (def.kind === 'heal') {
    const healed = Math.min(def.value, me.maxLife - me.life);
    me.life += healed;
    addLog(state, `${who} play ${def.name} — restore ${healed} life.`);
  } else if (def.kind === 'guard') {
    me.shield += def.value;
    addLog(state, `${who} play ${def.name} — gain ${def.value} shield.`);
  }
  state.selected = -1;
  checkEnd(state);
  renderGame();
  return true;
}

/** Small promise-based pause used to pace the AI turn. */
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** The player's End Turn button: hand the table to Pyra. */
async function endPlayerTurn() {
  if (!game || game.phase !== 'play' || game.active !== 'player') return;
  game.selected = -1;
  game.active = 'ai';
  renderGame();
  await wait(AI_THINK_MS);
  await aiTurn();
}

/** Pyra's turn: play her best cards one by one, then hand back. */
async function aiTurn() {
  if (!game || game.phase !== 'play') return;
  startTurn(game, 'ai');
  renderGame();
  await wait(AI_PLAY_MS);
  while (game.phase === 'play') {
    const idx = pickBestCard(game, 'ai', game.rng);
    if (idx < 0) break;
    playCard(game, 'ai', idx);
    await wait(AI_PLAY_MS);
  }
  if (game.phase !== 'play') return;
  addLog(game, 'Pyra ends her turn.');
  game.round += 1;
  startTurn(game, 'player');
  renderGame();
}

/** Play again from the end screen. */
function playAgain() {
  newGame();
}

/** Boot: title screen, or a scripted screenshot state (?shot=title|play|win|loss). */
function bootGame() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (shot === 'play' || shot === 'win' || shot === 'loss') {
    applyShot(shot);
  } else {
    showTitle();
  }
}

document.addEventListener('DOMContentLoaded', bootGame);
