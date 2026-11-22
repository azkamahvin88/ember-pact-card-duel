/* shots.js — scripted states for the four screenshots (?shot=title|play|win|loss).
 * These only arrange the table for a photo: every state is built from the
 * same card definitions and rendered by the same renderer as a real game.
 * A normal duel still reaches victory and defeat by playing for real.
 */

'use strict';

/** Fill a duelist's deck with a fixed, face-plausible stack of cards. */
function scriptedDeck(ids) {
  return ids.slice();
}

/** Mid-game table: round 6, both hands full, life totals dented, a card selected. */
function shotPlay() {
  newGame();
  game.phase = 'play';
  game.round = 6;
  game.active = 'player';
  game.selected = 1;
  game.player.life = 24;
  game.player.shield = 3;
  game.player.mana = 5;
  game.player.maxMana = 6;
  game.player.guard = 'ember';
  game.player.hand = ['ember-spark', 'flame-pact', 'aqua-mend', 'stone-wall', 'sky-rend'];
  game.player.deck = scriptedDeck(['cinder-fang', 'gale-dart', 'tide-lash', 'deep-current', 'boulder-slam', 'inferno-roar', 'storm-gust', 'mountain-heart', 'aqua-mend', 'ember-spark', 'flame-pact', 'stone-wall', 'sky-rend', 'gale-dart']);
  game.ai.life = 19;
  game.ai.shield = 0;
  game.ai.mana = 4;
  game.ai.maxMana = 6;
  game.ai.guard = 'gale';
  game.ai.hand = ['cinder-fang', 'storm-gust', 'deep-current', 'stone-wall'];
  game.ai.deck = scriptedDeck(['ember-spark', 'tide-lash', 'boulder-slam', 'inferno-roar', 'gale-dart', 'flame-pact', 'aqua-mend', 'sky-rend', 'mountain-heart', 'cinder-fang', 'storm-gust', 'deep-current', 'stone-wall', 'ember-spark', 'tide-lash']);
  game.log = [
    'You play Flame Pact (element advantage +3!) — 8 damage. Pyra 19 ♥ · You 24 ♥.',
    'Pyra plays Storm Gust — 4 damage, 3 soaked by shield. Pyra 19 ♥ · You 24 ♥.',
    'Round 6 — your turn. 6 mana, draw a card.',
    'You play Cinder Fang — 4 damage. Pyra 23 ♥ · You 27 ♥.',
    'Pyra plays Boulder Slam — 5 damage. Pyra 23 ♥ · You 27 ♥.',
  ];
  renderGame();
}

/** Victory screen: Pyra at 0 life, your ember still burning. */
function shotWin() {
  newGame();
  game.phase = 'over';
  game.round = 9;
  game.winner = 'player';
  game.winReason = 'Pyra’s life fell to zero. The ember is yours.';
  game.player.life = 14;
  game.player.shield = 2;
  game.player.mana = 3;
  game.player.maxMana = 9;
  game.player.guard = 'ember';
  game.player.hand = ['aqua-mend', 'stone-wall'];
  game.player.deck = scriptedDeck(['ember-spark', 'cinder-fang', 'flame-pact', 'sky-rend']);
  game.ai.life = 0;
  game.ai.shield = 0;
  game.ai.mana = 0;
  game.ai.maxMana = 9;
  game.ai.guard = 'gale';
  game.ai.hand = ['storm-gust', 'deep-current'];
  game.ai.deck = scriptedDeck(['ember-spark', 'tide-lash', 'boulder-slam']);
  game.log = [
    'Victory! Pyra’s life fell to zero.',
    'You play Inferno Roar — 8 damage. Pyra 0 ♥ · You 14 ♥.',
    'Pyra plays Sky Rend — 7 damage. Pyra 8 ♥ · You 14 ♥.',
    'Round 9 — your turn. 9 mana, draw a card.',
  ];
  renderGame();
}

/** Defeat screen: your life at 0, Pyra standing. */
function shotLoss() {
  newGame();
  game.phase = 'over';
  game.round = 8;
  game.winner = 'ai';
  game.winReason = 'Your life fell to zero. Pyra keeps the ember… this time.';
  game.player.life = 0;
  game.player.shield = 0;
  game.player.mana = 2;
  game.player.maxMana = 8;
  game.player.guard = 'aqua';
  game.player.hand = ['ember-spark', 'gale-dart'];
  game.player.deck = scriptedDeck(['cinder-fang', 'flame-pact', 'sky-rend', 'tide-lash']);
  game.ai.life = 11;
  game.ai.shield = 4;
  game.ai.mana = 1;
  game.ai.maxMana = 8;
  game.ai.guard = 'ember';
  game.ai.hand = ['inferno-roar', 'boulder-slam'];
  game.ai.deck = scriptedDeck(['ember-spark', 'storm-gust', 'deep-current', 'stone-wall']);
  game.log = [
    'Defeat. Your life fell to zero.',
    'Pyra plays Inferno Roar — 8 damage. Pyra 11 ♥ · You 0 ♥.',
    'You play Aqua Mend — restore 6 life.',
    'Round 8 — Pyra’s turn.',
  ];
  renderGame();
}

/** Apply one scripted screenshot state by name. */
function applyShot(name) {
  if (name === 'play') shotPlay();
  else if (name === 'win') shotWin();
  else if (name === 'loss') shotLoss();
  else showTitle();
}
