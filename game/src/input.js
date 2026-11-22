/* input.js — mouse + keyboard for EMBER PACT.
 * Click a card to select it, then click its target: the enemy portrait to
 * strike, your own panel to heal or guard. Double-click a card plays it on
 * its default target. Keys: 1–7 select a hand card, Enter plays the selected
 * card, Space ends the turn, N starts a new duel.
 */

'use strict';

/** Play the selected card on its default target (enemy for attacks, self for heal/guard). */
function playSelected() {
  if (!game || game.phase !== 'play' || game.active !== 'player') return;
  if (game.selected < 0) return;
  const def = cardDef(game.player.hand[game.selected]);
  if (!def) return;
  playCard(game, 'player', game.selected);
}

/** Click handling for the player's hand (event delegation). */
function bindHandClicks() {
  document.getElementById('playerHand').addEventListener('click', (event) => {
    if (!game || game.phase !== 'play' || game.active !== 'player') return;
    const card = event.target.closest('.card');
    if (!card) return;
    const idx = Number(card.dataset.handIndex);
    if (Number.isNaN(idx)) return;
    if (game.selected === idx) {
      playSelected(); // second click on the same card plays it
    } else {
      game.selected = idx;
      renderGame();
    }
  });
}

/** Click handling for the two duelist panels (targets). */
function bindTargetClicks() {
  document.getElementById('aiPanel').addEventListener('click', () => {
    if (!game || game.phase !== 'play' || game.active !== 'player' || game.selected < 0) return;
    const def = cardDef(game.player.hand[game.selected]);
    if (!def) return;
    if (def.kind === 'heal' || def.kind === 'guard') {
      game.selected = -1; // heal/guard cannot target the enemy
      renderGame();
      return;
    }
    playSelected();
  });
  document.getElementById('playerPanel').addEventListener('click', () => {
    if (!game || game.phase !== 'play' || game.active !== 'player' || game.selected < 0) return;
    const def = cardDef(game.player.hand[game.selected]);
    if (!def) return;
    if (def.kind === 'heal' || def.kind === 'guard') playSelected();
  });
}

/** Buttons: begin, end turn, play again, new game. */
function bindButtons() {
  document.getElementById('beginBtn').addEventListener('click', () => newGame());
  document.getElementById('endTurnBtn').addEventListener('click', () => endPlayerTurn());
  document.getElementById('againBtn').addEventListener('click', () => playAgain());
  document.getElementById('newGameBtn').addEventListener('click', () => newGame());
}

/** Keyboard shortcuts. */
function bindKeyboard() {
  document.addEventListener('keydown', (event) => {
    if (!game) return;
    if (event.key >= '1' && event.key <= '7') {
      const idx = Number(event.key) - 1;
      if (game.phase === 'play' && game.active === 'player' && idx < game.player.hand.length) {
        game.selected = idx;
        renderGame();
      }
    } else if (event.key === 'Enter') {
      playSelected();
    } else if (event.key === ' ') {
      event.preventDefault();
      endPlayerTurn();
    } else if (event.key === 'n' || event.key === 'N') {
      newGame();
    } else if (event.key === 'Escape') {
      game.selected = -1;
      renderGame();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  bindHandClicks();
  bindTargetClicks();
  bindButtons();
  bindKeyboard();
});
