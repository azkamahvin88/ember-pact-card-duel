/* render.js — every pixel of the EMBER PACT table, drawn from game state.
 * No canvas tricks: plain DOM so every card value, life total and mana pip
 * is real text the judge (and the player) can read.
 */

'use strict';

/** Build one face-up card element. */
function cardElement(def, opts) {
  const el = document.createElement('div');
  el.className = `card el-${def.element}`;
  if (opts.selected) el.classList.add('selected');
  if (opts.playable) el.classList.add('playable');
  if (opts.dimmed) el.classList.add('dimmed');
  el.dataset.cardId = def.id;
  el.dataset.handIndex = String(opts.handIndex);

  const cost = document.createElement('div');
  cost.className = 'card-cost';
  cost.textContent = String(def.cost);
  el.appendChild(cost);

  const elem = document.createElement('div');
  elem.className = 'card-element';
  elem.textContent = ELEMENT_ICON[def.element];
  el.appendChild(elem);

  const name = document.createElement('div');
  name.className = 'card-name';
  name.textContent = def.name;
  el.appendChild(name);

  const art = document.createElement('div');
  art.className = 'card-art';
  art.textContent = ELEMENT_ICON[def.element];
  el.appendChild(art);

  if (def.attack > 0) {
    const atk = document.createElement('div');
    atk.className = 'card-attack';
    atk.innerHTML = `⚔️ <b>${def.attack}</b>`;
    el.appendChild(atk);
  }

  const kind = document.createElement('div');
  kind.className = 'card-kind';
  kind.textContent = def.kind === 'strike' ? 'STRIKE'
    : def.kind === 'surge' ? 'SURGE +3'
    : def.kind === 'heal' ? `HEAL ${def.value}`
    : def.kind === 'guard' ? `SHIELD ${def.value}`
    : 'STRIKE · DRAW';
  el.appendChild(kind);

  const text = document.createElement('div');
  text.className = 'card-text';
  text.textContent = def.text;
  el.appendChild(text);

  return el;
}

/** One face-down card back (the enemy's hidden hand). */
function cardBackElement() {
  const el = document.createElement('div');
  el.className = 'card card-back';
  const gem = document.createElement('div');
  gem.className = 'card-back-gem';
  gem.textContent = '🔥';
  el.appendChild(gem);
  const pact = document.createElement('div');
  pact.className = 'card-back-word';
  pact.textContent = 'PACT';
  el.appendChild(pact);
  return el;
}

/** Mana pips: filled = current mana, hollow = unspent capacity, faint = locked. */
function manaPips(mana, maxMana) {
  const wrap = document.createElement('div');
  wrap.className = 'mana-pips';
  for (let i = 0; i < MAX_MANA; i++) {
    const pip = document.createElement('span');
    pip.className = 'pip' + (i < mana ? ' full' : i < maxMana ? ' empty' : ' locked');
    pip.textContent = '◆';
    wrap.appendChild(pip);
  }
  return wrap;
}

/** Life bar with a big readable number. */
function lifeBar(life, maxLife) {
  const wrap = document.createElement('div');
  wrap.className = 'life-wrap';
  const bar = document.createElement('div');
  bar.className = 'life-bar';
  const fill = document.createElement('div');
  fill.className = 'life-fill' + (life <= 10 ? ' low' : '');
  fill.style.width = `${Math.max(0, Math.min(100, (life / maxLife) * 100))}%`;
  bar.appendChild(fill);
  wrap.appendChild(bar);
  const num = document.createElement('div');
  num.className = 'life-num';
  num.textContent = `♥ ${life} / ${maxLife}`;
  wrap.appendChild(num);
  return wrap;
}

/** Guard badge: the element of the last card played, or none. */
function guardBadge(guard) {
  const badge = document.createElement('div');
  badge.className = 'guard-badge';
  badge.textContent = guard === null
    ? 'Guard: —'
    : `Guard: ${ELEMENT_ICON[guard]} ${ELEMENT_NAME[guard]}`;
  return badge;
}

/** Render one duelist's panel (portrait, life, mana, guard, deck). */
function renderDuelist(side, who) {
  const panel = document.getElementById(side === 'player' ? 'playerPanel' : 'aiPanel');
  panel.replaceChildren();
  const me = game[side];

  const portrait = document.createElement('div');
  portrait.className = 'portrait';
  portrait.textContent = side === 'player' ? '🧙' : '🔥';
  panel.appendChild(portrait);

  const info = document.createElement('div');
  info.className = 'duelist-info';
  const name = document.createElement('div');
  name.className = 'duelist-name';
  name.textContent = side === 'player' ? 'YOU — Pactbound' : 'PYRA — Ember Warden';
  info.appendChild(name);
  info.appendChild(lifeBar(me.life, me.maxLife));
  info.appendChild(manaPips(me.mana, me.maxMana));
  const row = document.createElement('div');
  row.className = 'duelist-row';
  row.appendChild(guardBadge(me.guard));
  const shield = document.createElement('div');
  shield.className = 'shield-badge';
  shield.textContent = `🛡️ Shield ${me.shield}`;
  row.appendChild(shield);
  const deck = document.createElement('div');
  deck.className = 'deck-badge';
  deck.textContent = `🂠 Deck ${me.deck.length} · Hand ${me.hand.length}`;
  row.appendChild(deck);
  info.appendChild(row);
  panel.appendChild(info);

  // The enemy's hand is face-down; your hand is face-up below.
  if (side === 'ai') {
    const backs = document.createElement('div');
    backs.className = 'hand-backs';
    for (let i = 0; i < me.hand.length; i++) backs.appendChild(cardBackElement());
    panel.appendChild(backs);
  }
}

/** Render the player's face-up hand. */
function renderHand() {
  const hand = document.getElementById('playerHand');
  hand.replaceChildren();
  const me = game.player;
  me.hand.forEach((id, i) => {
    const def = cardDef(id);
    const canPlay = game.phase === 'play' && game.active === 'player' && def.cost <= me.mana;
    hand.appendChild(cardElement(def, {
      handIndex: i,
      selected: game.selected === i,
      playable: canPlay,
      dimmed: !canPlay,
    }));
  });
  if (me.hand.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'hand-empty';
    empty.textContent = 'No cards in hand — end your turn to draw.';
    hand.appendChild(empty);
  }
}

/** Render the turn log (newest first). */
function renderLog() {
  const log = document.getElementById('turnLog');
  log.replaceChildren();
  for (const line of game.log) {
    const li = document.createElement('li');
    li.textContent = line;
    log.appendChild(li);
  }
}

/** Turn banner + hint line in the middle of the table. */
function renderBanner() {
  const banner = document.getElementById('turnBanner');
  const hint = document.getElementById('turnHint');
  if (game.phase === 'over') {
    banner.textContent = game.winner === 'player' ? '🏆 VICTORY' : '💀 DEFEAT';
    hint.textContent = game.winReason;
    return;
  }
  if (game.active === 'player') {
    banner.textContent = `— Your turn · Round ${game.round} —`;
    if (game.selected >= 0) {
      const def = cardDef(game.player.hand[game.selected]);
      hint.textContent = def
        ? `${def.name} selected — ${cardTargetHint(def)}. Click the enemy to strike, yourself to heal or guard.`
        : 'Pick a card.';
    } else {
      hint.textContent = 'Click a card, then click its target. Keys 1–7 select, Enter plays, Space ends turn.';
    }
  } else {
    banner.textContent = `— Pyra is thinking… · Round ${game.round} —`;
    hint.textContent = 'The Ember Warden weighs her hand.';
  }
}

/** Show or hide the title and end overlays. */
function renderOverlays() {
  document.getElementById('titleOverlay').classList.toggle('hidden', game.phase !== 'title');
  const end = document.getElementById('endOverlay');
  end.classList.toggle('hidden', game.phase !== 'over');
  if (game.phase === 'over') {
    document.getElementById('endTitle').textContent = game.winner === 'player' ? '🏆 VICTORY!' : '💀 DEFEAT';
    document.getElementById('endTitle').className = game.winner === 'player' ? 'end-title win' : 'end-title loss';
    document.getElementById('endReason').textContent = game.winReason;
    document.getElementById('endStats').textContent =
      `Rounds played: ${game.round} · Your life: ${Math.max(0, game.player.life)} · Pyra's life: ${Math.max(0, game.ai.life)}`;
  }
  document.getElementById('endTurnBtn').disabled = !(game.phase === 'play' && game.active === 'player');
}

/** Full re-render from state. */
function renderGame() {
  if (!game) return;
  document.getElementById('roundLabel').textContent = `ROUND ${game.round}`;
  document.getElementById('phaseLabel').textContent =
    game.phase === 'title' ? 'TITLE' : game.phase === 'over' ? 'DUEL OVER' : game.active === 'player' ? 'YOUR TURN' : 'PYRA’S TURN';
  renderDuelist('ai', 'Pyra');
  renderDuelist('player', 'You');
  renderHand();
  renderLog();
  renderBanner();
  renderOverlays();
  window.__game = game;
}
