/* ============================================================
Royal Blackjack — game.js
Features: multi-deck, betting, split, double down,
basic strategy hints, P2P multiplayer (PeerJS)
============================================================ */

‘use strict’;

// ─── PeerJS loaded lazily ────────────────────────────────────
let Peer = null;
async function loadPeerJS() {
if (Peer) return;
await new Promise((res, rej) => {
const s = document.createElement(‘script’);
s.src = ‘https://cdnjs.cloudflare.com/ajax/libs/peerjs/1.5.2/peerjs.min.js’;
s.onload = res; s.onerror = rej;
document.head.appendChild(s);
});
Peer = window.Peer;
}

// ─── Constants ───────────────────────────────────────────────
const NUM_DECKS   = 6;
const SUITS       = [‘♠’,‘♥’,‘♦’,‘♣’];
const RANKS       = [‘A’,‘2’,‘3’,‘4’,‘5’,‘6’,‘7’,‘8’,‘9’,‘10’,‘J’,‘Q’,‘K’];
const STARTING_CHIPS = 1000;

// ─── State ───────────────────────────────────────────────────
let state = {
mode: ‘solo’,     // ‘solo’ | ‘host’ | ‘client’
shoe: [],
playerHands: [],  // array of {cards, bet, done, doubled}
activeHandIdx: 0,
dealerHand: [],
chips: STARTING_CHIPS,
currentBet: 0,
phase: ‘betting’, // ‘betting’ | ‘playing’ | ‘dealer’ | ‘result’
// Multiplayer
peer: null,
conn: null,       // host → one conn per client; client → one conn to host
connections: [],  // host only: list of DataConnection
roomCode: ‘’,
playerName: ‘’,
players: [],      // [{id, name, chips, hand, bet, done, status}]
myId: ‘’,
isHost: false,
mpPhase: ‘waiting’, // waiting | betting | playing | dealer | result
};

// ─── Helpers ─────────────────────────────────────────────────
function buildShoe(numDecks) {
const shoe = [];
for (let d = 0; d < numDecks; d++)
for (const suit of SUITS)
for (const rank of RANKS)
shoe.push({ rank, suit });
return shuffle(shoe);
}
function shuffle(arr) {
for (let i = arr.length - 1; i > 0; i–) {
const j = Math.floor(Math.random() * (i + 1));
[arr[i], arr[j]] = [arr[j], arr[i]];
}
return arr;
}
function drawCard() {
if (state.shoe.length < 20) state.shoe = buildShoe(NUM_DECKS);
return state.shoe.pop();
}
function cardValue(card) {
if ([‘J’,‘Q’,‘K’].includes(card.rank)) return 10;
if (card.rank === ‘A’) return 11;
return parseInt(card.rank);
}
function handTotal(cards) {
let total = 0, aces = 0;
for (const c of cards) {
total += cardValue(c);
if (c.rank === ‘A’) aces++;
}
while (total > 21 && aces > 0) { total -= 10; aces–; }
return total;
}
function isBust(cards)      { return handTotal(cards) > 21; }
function isBlackjack(cards) { return cards.length === 2 && handTotal(cards) === 21; }
function isRed(card)        { return card.suit === ‘♥’ || card.suit === ‘♦’; }

// ─── Card DOM ─────────────────────────────────────────────────
function makeCardEl(card, hidden = false, small = false) {
const el = document.createElement(‘div’);
el.className = ‘card deal-anim’ + (hidden ? ’ card-back’ : ‘’) + (isRed(card) ? ’ red’ : ’ black-suit’);
if (!hidden) {
el.innerHTML = ` <div class="card-corner"> <div class="card-value">${card.rank}</div> <div class="card-suit">${card.suit}</div> </div> <div class="card-center">${card.suit}</div>`;
}
return el;
}

// ─── Render ──────────────────────────────────────────────────
function renderDealer(hideSecond = true) {
const el = document.getElementById(‘dealer-hand’);
el.innerHTML = ‘’;
state.dealerHand.forEach((c, i) => {
el.appendChild(makeCardEl(c, hideSecond && i === 1));
});
const total = hideSecond
? (state.dealerHand.length ? cardValue(state.dealerHand[0]) : 0)
: handTotal(state.dealerHand);
const scoreEl = document.getElementById(‘dealer-score’);
scoreEl.textContent = hideSecond ? `${total}+?` : total;
scoreEl.className = ‘score-badge’ +
(!hideSecond && isBust(state.dealerHand) ? ’ bust’ :
!hideSecond && isBlackjack(state.dealerHand) ? ’ blackjack’ : ‘’);
}

function renderPlayerHands() {
const wrapper = document.getElementById(‘player-hands-wrapper’);
wrapper.innerHTML = ‘’;
state.playerHands.forEach((hand, idx) => {
const block = document.createElement(‘div’);
block.className = ‘player-hand-block’ + (idx === state.activeHandIdx && state.phase === ‘playing’ ? ’ active-hand’ : ‘’);
// label
if (state.playerHands.length > 1) {
const lbl = document.createElement(‘div’);
lbl.className = ‘hand-label’;
lbl.textContent = `Hand ${idx + 1}`;
block.appendChild(lbl);
}
// cards
const handEl = document.createElement(‘div’);
handEl.className = ‘hand’;
hand.cards.forEach(c => handEl.appendChild(makeCardEl(c)));
block.appendChild(handEl);
// score
const scoreEl = document.createElement(‘div’);
const total = handTotal(hand.cards);
scoreEl.className = ‘score-badge’ + (isBust(hand.cards) ? ’ bust’ : isBlackjack(hand.cards) ? ’ blackjack’ : ‘’);
scoreEl.textContent = total;
block.appendChild(scoreEl);
wrapper.appendChild(block);
});
}

function renderChips() {
document.getElementById(‘player-chips-display’).textContent = state.chips;
document.getElementById(‘current-bet-display’).textContent  = state.currentBet;
}

function setPhaseUI(phase) {
document.getElementById(‘bet-bar’).classList.toggle(‘hidden’, phase !== ‘betting’);
document.getElementById(‘action-bar’).classList.toggle(‘hidden’, phase !== ‘playing’);
document.getElementById(‘result-overlay’).classList.toggle(‘hidden’, phase !== ‘result’);
updateActionButtons();
}

function updateActionButtons() {
if (state.phase !== ‘playing’) return;
const hand = state.playerHands[state.activeHandIdx];
if (!hand) return;
const canDouble = hand.cards.length === 2 && state.chips >= hand.bet;
const canSplit  = hand.cards.length === 2 &&
hand.cards[0].rank === hand.cards[1].rank &&
state.playerHands.length < 4 &&
state.chips >= hand.bet;
document.getElementById(‘btn-double’).disabled = !canDouble;
document.getElementById(‘btn-split’).disabled  = !canSplit;
}

// ─── Hint system (basic strategy) ────────────────────────────
const hintMessages = {
‘H’: ‘💡 Hit — take another card.’,
‘S’: ‘💡 Stand — don't take more cards.’,
‘D’: ‘💡 Double Down — double your bet and take one card.’,
‘P’: ‘💡 Split — split into two hands.’,
‘Dh’:‘💡 Double if allowed, otherwise Hit.’,
‘Ds’:‘💡 Double if allowed, otherwise Stand.’,
};
function getBasicStrategy(playerCards, dealerUpCard) {
const total     = handTotal(playerCards);
const dVal      = Math.min(cardValue(dealerUpCard), 10);
const soft      = playerCards.some(c => c.rank === ‘A’) && total <= 21 && (total - 10) >= 11;
const isPair    = playerCards.length === 2 && playerCards[0].rank === playerCards[1].rank;
// Pair splitting
if (isPair) {
const r = playerCards[0].rank;
if (r === ‘A’ || r === ‘8’) return ‘P’;
if ([‘2’,‘3’,‘7’].includes(r) && dVal <= 7) return ‘P’;
if (r === ‘4’ && (dVal === 5 || dVal === 6)) return ‘P’;
if (r === ‘6’ && dVal <= 6) return ‘P’;
if (r === ‘9’ && dVal !== 7 && dVal <= 9) return ‘P’;
}
// Soft totals
if (soft) {
if (total >= 19) return ‘S’;
if (total === 18) return dVal >= 9 ? ‘H’ : (dVal <= 6 ? ‘Ds’ : ‘S’);
if (total === 17) return dVal >= 3 && dVal <= 6 ? ‘Dh’ : ‘H’;
if (total >= 15 && total <= 16) return dVal >= 4 && dVal <= 6 ? ‘Dh’ : ‘H’;
if (total >= 13 && total <= 14) return dVal >= 5 && dVal <= 6 ? ‘Dh’ : ‘H’;
}
// Hard totals
if (total >= 17) return ‘S’;
if (total >= 13 && total <= 16) return dVal <= 6 ? ‘S’ : ‘H’;
if (total === 12) return dVal >= 4 && dVal <= 6 ? ‘S’ : ‘H’;
if (total === 11) return dVal <= 10 ? ‘D’ : ‘H’;
if (total === 10) return dVal <= 9 ? ‘D’ : ‘H’;
if (total === 9)  return dVal >= 3 && dVal <= 6 ? ‘Dh’ : ‘H’;
return ‘H’;
}
function showHint() {
if (state.phase !== ‘playing’) return;
const hand = state.playerHands[state.activeHandIdx];
if (!hand || !state.dealerHand[0]) return;
const action = getBasicStrategy(hand.cards, state.dealerHand[0]);
const box = document.getElementById(‘hint-box’);
box.textContent = hintMessages[action] || ‘💡 Good luck!’;
box.classList.remove(‘hidden’);
clearTimeout(window._hintTimer);
window._hintTimer = setTimeout(() => box.classList.add(‘hidden’), 4000);
}

// ─── Game Logic ───────────────────────────────────────────────
function startSolo() {
state.mode = ‘solo’;
state.chips = STARTING_CHIPS;
state.shoe  = buildShoe(NUM_DECKS);
showScreen(‘game-screen’);
document.getElementById(‘mp-seats’).classList.add(‘hidden’);
newRound();
}

function newRound() {
state.phase       = ‘betting’;
state.currentBet  = 0;
state.playerHands = [];
state.activeHandIdx = 0;
state.dealerHand  = [];
document.getElementById(‘hint-box’).classList.add(‘hidden’);
renderDealer(false);
renderPlayerHands();
renderChips();
setPhaseUI(‘betting’);
if (state.chips <= 0) {
showResult(‘Out of Chips!’, ‘Game over. Refreshing…’, ‘lose’);
setTimeout(() => { state.chips = STARTING_CHIPS; newRound(); }, 3000);
}
}

function placeBet(amount) {
if (state.phase !== ‘betting’) return;
if (state.chips - state.currentBet < amount) return;
state.currentBet += amount;
renderChips();
}
function clearBet() {
state.currentBet = 0;
renderChips();
}
function deal() {
if (state.currentBet <= 0) return;
if (state.currentBet > state.chips) return;
state.chips -= state.currentBet;
state.playerHands = [{ cards: [], bet: state.currentBet, done: false, doubled: false }];
state.activeHandIdx = 0;
state.dealerHand = [];
// Deal 2 cards each
state.playerHands[0].cards.push(drawCard(), drawCard());
state.dealerHand.push(drawCard(), drawCard());
state.phase = ‘playing’;
renderDealer(true);
renderPlayerHands();
renderChips();
setPhaseUI(‘playing’);
// Check natural blackjack
if (isBlackjack(state.playerHands[0].cards)) {
endPlaying();
}
}

function hit() {
if (state.phase !== ‘playing’) return;
const hand = state.playerHands[state.activeHandIdx];
hand.cards.push(drawCard());
renderPlayerHands();
if (isBust(hand.cards) || handTotal(hand.cards) === 21) {
hand.done = true;
advanceHand();
}
}
function stand() {
if (state.phase !== ‘playing’) return;
state.playerHands[state.activeHandIdx].done = true;
advanceHand();
}
function doubleDown() {
if (state.phase !== ‘playing’) return;
const hand = state.playerHands[state.activeHandIdx];
if (hand.cards.length !== 2 || state.chips < hand.bet) return;
state.chips -= hand.bet;
hand.bet *= 2;
hand.doubled = true;
hand.cards.push(drawCard());
renderPlayerHands();
renderChips();
hand.done = true;
advanceHand();
}
function split() {
if (state.phase !== ‘playing’) return;
const hand = state.playerHands[state.activeHandIdx];
if (hand.cards.length !== 2 || hand.cards[0].rank !== hand.cards[1].rank) return;
if (state.chips < hand.bet) return;
state.chips -= hand.bet;
renderChips();
const newHand = { cards: [hand.cards.pop()], bet: hand.bet, done: false, doubled: false };
hand.cards.push(drawCard());
newHand.cards.push(drawCard());
state.playerHands.splice(state.activeHandIdx + 1, 0, newHand);
renderPlayerHands();
updateActionButtons();
// If split aces → auto-stand each
if (hand.cards[0].rank === ‘A’) {
hand.done = true;
newHand.done = true;
advanceHand();
}
}
function advanceHand() {
const next = state.playerHands.findIndex((h, i) => i > state.activeHandIdx && !h.done);
if (next !== -1) {
state.activeHandIdx = next;
renderPlayerHands();
updateActionButtons();
} else {
endPlaying();
}
}
function endPlaying() {
state.phase = ‘dealer’;
setPhaseUI(‘dealer’);
runDealer();
}
function runDealer() {
renderDealer(false);
// Dealer hits on soft 17
const interval = setInterval(() => {
if (handTotal(state.dealerHand) < 17 ||
(isSoft(state.dealerHand) && handTotal(state.dealerHand) === 17)) {
state.dealerHand.push(drawCard());
renderDealer(false);
} else {
clearInterval(interval);
resolveRound();
}
}, 600);
}
function isSoft(cards) {
let total = 0, aces = 0;
for (const c of cards) { total += cardValue(c); if (c.rank === ‘A’) aces++; }
return aces > 0 && total <= 21 && (total - 10) >= 11;
}

function resolveRound() {
const dTotal = handTotal(state.dealerHand);
const dBust   = isBust(state.dealerHand);
const dBJ     = isBlackjack(state.dealerHand);
let totalWin = 0;
let outcomes = [];

for (const hand of state.playerHands) {
const pTotal = handTotal(hand.cards);
const pBust  = isBust(hand.cards);
const pBJ    = isBlackjack(hand.cards) && state.playerHands.length === 1;
let win = 0;
let label = ‘’;
if (pBust) {
label = ‘Bust’; win = 0;
} else if (pBJ && !dBJ) {
label = ‘Blackjack!’; win = Math.floor(hand.bet * 2.5);
} else if (dBust || pTotal > dTotal) {
label = ‘Win!’; win = hand.bet * 2;
} else if (pTotal === dTotal) {
label = ‘Push’; win = hand.bet;
} else {
label = ‘Lose’; win = 0;
}
totalWin += win;
outcomes.push(label);
}

state.chips += totalWin;
state.phase = ‘result’;

const mainOutcome = outcomes.find(o => o === ‘Blackjack!’) ||
outcomes.find(o => o === ‘Win!’) ||
outcomes.find(o => o === ‘Push’) ||
outcomes[0] || ‘Lose’;

const titleClass = [‘Win!’,‘Blackjack!’].includes(mainOutcome) ? ‘’ :
mainOutcome === ‘Push’ ? ‘push’ : ‘lose’;
const detail = `${outcomes.join(' / ')}  •  Net: ${totalWin - state.playerHands.reduce((s,h)=>s+h.bet,0) >= 0 ? '+' : ''}${totalWin - state.playerHands.reduce((s,h)=>s+h.bet,0)}  •  Chips: ${state.chips}`;
showResult(mainOutcome, detail, titleClass);
renderChips();
}

function showResult(title, detail, cls = ‘’) {
document.getElementById(‘result-title’).textContent = title;
document.getElementById(‘result-title’).className = ’result-title ’ + cls;
document.getElementById(‘result-detail’).textContent = detail;
setPhaseUI(‘result’);
}

// ─── Multiplayer (PeerJS P2P) ─────────────────────────────────
// Protocol messages: {type, payload}
// Types: state_update, action, chat
// This is a simplified turn-based sync:
// Host manages game state, broadcasts to clients.
// Clients send actions to host.

function genRoomCode() {
return Math.random().toString(36).substr(2,6).toUpperCase();
}

async function hostGame() {
await loadPeerJS();
const name = document.getElementById(‘host-name-input’).value.trim() || ‘Host’;
state.playerName = name;
state.isHost = true;
state.mode = ‘host’;
state.roomCode = genRoomCode();
state.myId = state.roomCode + ‘-host’;
state.players = [{ id: state.myId, name, chips: STARTING_CHIPS, hand: [], bet: 0, done: false, status: ‘waiting’ }];
state.connections = [];

const peer = new Peer(state.myId, { debug: 1 });
state.peer = peer;

peer.on(‘open’, () => {
document.getElementById(‘display-room-code’).textContent = state.roomCode;
showScreen(‘waiting-room’);
renderWaitingRoom();
});

peer.on(‘connection’, conn => {
conn.on(‘open’, () => {
state.connections.push(conn);
conn.on(‘data’, data => hostReceive(conn, data));
conn.on(‘close’, () => { clientDisconnected(conn.peer); });
// Send current player list
hostBroadcast({ type: ‘player_list’, players: state.players, roomCode: state.roomCode });
});
});

peer.on(‘error’, e => alert(’Peer error: ’ + e.type));
}

async function joinGame() {
await loadPeerJS();
const code = document.getElementById(‘room-code-input’).value.trim().toUpperCase();
const name = document.getElementById(‘player-name-input’).value.trim() || ‘Player’;
if (!code) return;
state.playerName = name;
state.isHost = false;
state.mode = ‘client’;
state.roomCode = code;
state.myId = code + ‘-’ + Math.random().toString(36).substr(2,4);

const peer = new Peer(state.myId, { debug: 1 });
state.peer = peer;

peer.on(‘open’, () => {
const conn = peer.connect(code + ‘-host’);
state.conn = conn;
conn.on(‘open’, () => {
conn.send({ type: ‘join’, name, id: state.myId });
showScreen(‘waiting-room’);
});
conn.on(‘data’, data => clientReceive(data));
conn.on(‘error’, e => alert(‘Connection error’));
conn.on(‘close’, () => alert(‘Disconnected from host.’));
});
peer.on(‘error’, e => alert(‘Could not connect. Check room code.’));
}

function hostReceive(conn, data) {
if (data.type === ‘join’) {
const existing = state.players.find(p => p.id === data.id);
if (!existing) {
state.players.push({ id: data.id, name: data.name, chips: STARTING_CHIPS, hand: [], bet: 0, done: false, status: ‘waiting’ });
}
hostBroadcast({ type: ‘player_list’, players: state.players, roomCode: state.roomCode });
renderWaitingRoom();
}
if (data.type === ‘bet’) {
const p = state.players.find(p => p.id === data.id);
if (p) { p.bet = data.bet; p.status = ‘bet_placed’; }
checkAllBetsIn();
}
if (data.type === ‘action’) {
handleMpAction(data.id, data.action);
}
}

function clientReceive(data) {
if (data.type === ‘player_list’) {
state.players = data.players;
renderWaitingRoom();
}
if (data.type === ‘game_start’) {
state.players = data.players;
showScreen(‘game-screen’);
setupMpGameScreen();
showBetBarForClient();
}
if (data.type === ‘game_state’) {
state.dealerHand = data.dealerHand;
state.players = data.players;
const me = state.players.find(p => p.id === state.myId);
if (me) {
state.playerHands = [{ cards: me.hand, bet: me.bet, done: me.done, doubled: false }];
state.activeHandIdx = 0;
}
renderDealer(data.hideDealer);
renderPlayerHands();
renderMpSeats();
if (data.phase === ‘your_turn’) {
state.phase = ‘playing’;
setPhaseUI(‘playing’);
} else if (data.phase === ‘wait’) {
state.phase = ‘dealer’;
setPhaseUI(‘dealer’);
} else if (data.phase === ‘result’) {
state.phase = ‘result’;
resolveRound();
}
}
}

function hostBroadcast(msg) {
state.connections.forEach(c => { try { c.send(msg); } catch(e){} });
}
function sendToHost(msg) {
if (state.conn) state.conn.send(msg);
}

function startMpGame() {
if (!state.isHost) return;
if (state.players.length < 1) return;
state.shoe = buildShoe(NUM_DECKS);
state.players.forEach(p => { p.hand = []; p.bet = 0; p.done = false; p.status = ‘betting’; });
hostBroadcast({ type: ‘game_start’, players: state.players });
showScreen(‘game-screen’);
setupMpGameScreen();
// Host also bets
showBetBarForHost();
}

function setupMpGameScreen() {
document.getElementById(‘mp-seats’).classList.remove(‘hidden’);
renderMpSeats();
}

function showBetBarForHost() {
state.phase = ‘betting’;
state.currentBet = 0;
renderChips();
setPhaseUI(‘betting’);
document.getElementById(‘your-label’).textContent = state.playerName;
renderPlayerHands();
renderDealer(false);
}

function showBetBarForClient() {
state.phase = ‘betting’;
state.currentBet = 0;
const me = state.players.find(p => p.id === state.myId);
if (me) state.chips = me.chips;
renderChips();
setPhaseUI(‘betting’);
document.getElementById(‘your-label’).textContent = state.playerName;
renderPlayerHands();
renderDealer(false);
}

function mpDeal() {
// Client sends bet to host
if (!state.isHost) {
const me = state.players.find(p => p.id === state.myId);
if (me) { me.bet = state.currentBet; me.chips -= state.currentBet; }
sendToHost({ type: ‘bet’, id: state.myId, bet: state.currentBet });
state.phase = ‘dealer’;
setPhaseUI(‘dealer’);
document.getElementById(‘hint-box’).classList.add(‘hidden’);
return;
}
// Host places own bet
const hostPlayer = state.players.find(p => p.id === state.myId);
if (hostPlayer) { hostPlayer.bet = state.currentBet; hostPlayer.chips -= state.currentBet; state.chips -= state.currentBet; }
hostPlayer.status = ‘bet_placed’;
checkAllBetsIn();
}

function checkAllBetsIn() {
const allIn = state.players.every(p => p.bet > 0);
if (!allIn) return;
// Deal cards
state.players.forEach(p => { p.hand = [drawCard(), drawCard()]; p.done = false; });
state.dealerHand = [drawCard(), drawCard()];
renderDealer(true);
// Send state to each player in turn
mpNextTurn();
}

let mpTurnQueue = [];
function mpNextTurn() {
mpTurnQueue = state.players.map(p => p.id).filter(id => {
const p = state.players.find(p => p.id === id);
return !isBust(p.hand) && !isBlackjack(p.hand);
});
mpAdvanceTurn();
}

function mpAdvanceTurn() {
if (mpTurnQueue.length === 0) {
// Dealer’s turn
mpRunDealer();
return;
}
const currentId = mpTurnQueue[0];
// Broadcast state
state.players.forEach(p => {
const isMe = p.id === currentId;
const msg = {
type: ‘game_state’,
dealerHand: state.dealerHand,
players: state.players,
hideDealer: true,
phase: isMe ? ‘your_turn’ : ‘wait’,
};
if (currentId === state.myId) {
// Host’s turn locally
const me = state.players.find(p => p.id === state.myId);
state.playerHands = [{ cards: me.hand, bet: me.bet, done: false, doubled: false }];
state.activeHandIdx = 0;
renderDealer(true);
renderPlayerHands();
renderMpSeats();
state.phase = ‘playing’;
setPhaseUI(‘playing’);
}
const conn = state.connections.find(c => c.peer === p.id);
if (conn) conn.send(msg);
});
hostBroadcast({ type: ‘game_state’, dealerHand: state.dealerHand, players: state.players, hideDealer: true, phase: ‘wait’ });
if (currentId === state.myId) {
const me = state.players.find(p => p.id === state.myId);
state.playerHands = [{ cards: me.hand, bet: me.bet, done: false, doubled: false }];
state.activeHandIdx = 0;
renderDealer(true);
renderPlayerHands();
renderMpSeats();
state.phase = ‘playing’;
setPhaseUI(‘playing’);
} else {
// Send directly to current player
const conn = state.connections.find(c => c.peer === currentId);
if (conn) conn.send({ type: ‘game_state’, dealerHand: state.dealerHand, players: state.players, hideDealer: true, phase: ‘your_turn’ });
}
}

function handleMpAction(playerId, action) {
const p = state.players.find(p => p.id === playerId);
if (!p) return;
if (action === ‘hit’) {
p.hand.push(drawCard());
if (isBust(p.hand) || handTotal(p.hand) === 21) { mpTurnQueue.shift(); mpAdvanceTurn(); }
else { mpAdvanceTurn(); } // re-send state
}
if (action === ‘stand’) { mpTurnQueue.shift(); mpAdvanceTurn(); }
if (action === ‘double’) {
if (p.chips >= p.bet) { p.chips -= p.bet; p.bet *= 2; p.hand.push(drawCard()); }
mpTurnQueue.shift(); mpAdvanceTurn();
}
}

function mpPlayerAction(action) {
if (!state.isHost) {
sendToHost({ type: ‘action’, id: state.myId, action });
state.phase = ‘dealer’;
setPhaseUI(‘dealer’);
} else {
handleMpAction(state.myId, action);
}
}

function mpRunDealer() {
const interval = setInterval(() => {
if (handTotal(state.dealerHand) < 17) {
state.dealerHand.push(drawCard());
} else {
clearInterval(interval);
mpResolveAll();
}
}, 600);
}

function mpResolveAll() {
const dTotal = handTotal(state.dealerHand);
const dBust  = isBust(state.dealerHand);
state.players.forEach(p => {
const pTotal = handTotal(p.hand);
const pBust  = isBust(p.hand);
const pBJ    = isBlackjack(p.hand);
if (pBust) { p.result = ‘Bust’; }
else if (pBJ && !isBlackjack(state.dealerHand)) { p.chips += Math.floor(p.bet * 2.5); p.result = ‘Blackjack!’; }
else if (dBust || pTotal > dTotal) { p.chips += p.bet * 2; p.result = ‘Win!’; }
else if (pTotal === dTotal) { p.chips += p.bet; p.result = ‘Push’; }
else { p.result = ‘Lose’; }
});
// Broadcast final state
hostBroadcast({ type: ‘game_state’, dealerHand: state.dealerHand, players: state.players, hideDealer: false, phase: ‘result’ });
// Host resolves locally
renderDealer(false);
renderMpSeats();
const me = state.players.find(p => p.id === state.myId);
state.chips = me ? me.chips : state.chips;
renderChips();
const res = me ? me.result : ‘Done’;
const titleClass = [‘Win!’,‘Blackjack!’].includes(res) ? ‘’ : res === ‘Push’ ? ‘push’ : ‘lose’;
showResult(res, `Dealer: ${handTotal(state.dealerHand)}  •  Chips: ${state.chips}`, titleClass);
}

function renderMpSeats() {
const seats = document.getElementById(‘mp-seats’);
seats.innerHTML = ‘’;
state.players.forEach(p => {
const seat = document.createElement(‘div’);
seat.className = ‘mp-seat’ + (p.id === mpTurnQueue[0] ? ’ active-seat’ : ‘’);
seat.innerHTML = ` <div class="seat-name">${p.name}${p.id === state.myId ? ' (You)' : ''}</div> <div class="seat-hand"></div> <div class="seat-chips">🪙 ${p.chips}</div> <div class="seat-status">${p.result || p.status || ''}</div>`;
const handEl = seat.querySelector(’.seat-hand’);
(p.hand || []).forEach(c => handEl.appendChild(makeCardEl(c, false, true)));
seats.appendChild(seat);
});
}

function renderWaitingRoom() {
const list = document.getElementById(‘player-list’);
list.innerHTML = ‘’;
state.players.forEach((p, i) => {
const item = document.createElement(‘div’);
item.className = ‘player-list-item’;
item.innerHTML = `${p.name} ${i === 0 ? '<span class="host-badge">HOST</span>' : ''}`;
list.appendChild(item);
});
// Show start btn only for host
document.getElementById(‘btn-start-mp’).classList.toggle(‘hidden’, !state.isHost);
}

function clientDisconnected(peerId) {
state.players = state.players.filter(p => p.id !== peerId);
state.connections = state.connections.filter(c => c.peer !== peerId);
hostBroadcast({ type: ‘player_list’, players: state.players });
renderWaitingRoom();
}

// ─── Screen switching ─────────────────────────────────────────
function showScreen(id) {
document.querySelectorAll(’.screen’).forEach(s => s.classList.remove(‘active’));
document.getElementById(id).classList.add(‘active’);
}

// ─── iOS Safari touch helper ──────────────────────────────────
function addTap(id, fn) {
const el = document.getElementById(id);
if (!el) return;
el.addEventListener(‘click’, fn);
el.addEventListener(‘touchend’, (e) => { e.preventDefault(); fn(e); });
}

// ─── Event wiring ─────────────────────────────────────────────
window.addEventListener(‘DOMContentLoaded’, () => {
// Lobby
addTap(‘btn-solo’, () => startSolo());
addTap(‘btn-host’, () => {
document.getElementById(‘host-form’).classList.remove(‘hidden’);
document.getElementById(‘join-form’).classList.add(‘hidden’);
});
addTap(‘btn-host-confirm’, () => hostGame());
addTap(‘btn-host-cancel’, () => document.getElementById(‘host-form’).classList.add(‘hidden’));
addTap(‘btn-join’, () => {
document.getElementById(‘join-form’).classList.remove(‘hidden’);
document.getElementById(‘host-form’).classList.add(‘hidden’);
});
addTap(‘btn-join-confirm’, () => joinGame());
addTap(‘btn-join-cancel’, () => document.getElementById(‘join-form’).classList.add(‘hidden’));

// Waiting room
addTap(‘btn-copy-code’, () => {
navigator.clipboard.writeText(state.roomCode).then(() => {
document.getElementById(‘btn-copy-code’).textContent = ‘Copied!’;
setTimeout(() => document.getElementById(‘btn-copy-code’).textContent = ‘Copy’, 2000);
});
});
addTap(‘btn-start-mp’, () => startMpGame());
addTap(‘btn-leave-room’, () => {
if (state.peer) state.peer.destroy();
showScreen(‘lobby’);
});

// Chips
document.querySelectorAll(’.chip’).forEach(btn => {
const val = parseInt(btn.dataset.val);
btn.addEventListener(‘click’, () => placeBet(val));
btn.addEventListener(‘touchend’, (e) => { e.preventDefault(); placeBet(val); });
});
addTap(‘btn-clear-bet’, clearBet);
addTap(‘btn-deal’, () => {
if (state.mode === ‘solo’) deal();
else mpDeal();
});

// Actions
addTap(‘btn-hit’, () => {
if (state.mode === ‘solo’) hit();
else mpPlayerAction(‘hit’);
});
addTap(‘btn-stand’, () => {
if (state.mode === ‘solo’) stand();
else mpPlayerAction(‘stand’);
});
addTap(‘btn-double’, () => {
if (state.mode === ‘solo’) doubleDown();
else mpPlayerAction(‘double’);
});
addTap(‘btn-split’, () => {
if (state.mode === ‘solo’) split();
});

// Hint
addTap(‘btn-hint’, showHint);

// Next round
addTap(‘btn-next-round’, () => {
if (state.mode === ‘solo’) newRound();
else {
if (state.isHost) {
state.players.forEach(p => { p.hand = []; p.bet = 0; p.done = false; p.result = ‘’; p.status = ‘betting’; });
hostBroadcast({ type: ‘game_start’, players: state.players });
showBetBarForHost();
} else {
sendToHost({ type: ‘ready_next’ });
state.phase = ‘dealer’;
setPhaseUI(‘dealer’);
}
}
});

// Menu
addTap(‘btn-menu’, () => {
document.getElementById(‘menu-overlay’).classList.toggle(‘hidden’);
});
addTap(‘btn-resume’, () => {
document.getElementById(‘menu-overlay’).classList.add(‘hidden’);
});
addTap(‘btn-back-lobby’, () => {
if (state.peer) state.peer.destroy();
document.getElementById(‘menu-overlay’).classList.add(‘hidden’);
showScreen(‘lobby’);
});
});