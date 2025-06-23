// app.js

let deck, playerHand, dealerHand;
let playerScore = 0, dealerScore = 0;
let isGameOver = false;

const hitBtn = document.getElementById("hitBtn");
const standBtn = document.getElementById("standBtn");
const newGameBtn = document.getElementById("newGameBtn");
const playerHandEl = document.getElementById("playerHand");
const dealerHandEl = document.getElementById("dealerHand");
const playerScoreEl = document.getElementById("playerScore");
const dealerScoreEl = document.getElementById("dealerScore");
const resultEl = document.getElementById("result");

const suits = ['♠', '♣', '♦', '♥'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// Create a deck of cards
function createDeck() {
    let deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit: suit, value: value });
        }
    }
    return deck;
}

// Shuffle the deck
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// Deal a card to a player
function dealCard(hand) {
    return hand.push(deck.pop());
}

// Get the score of a hand
function getHandScore(hand) {
    let score = 0;
    let aceCount = 0;
    for (let card of hand) {
        if (card.value === 'A') {
            score += 11;
            aceCount++;
        } else if (['K', 'Q', 'J'].includes(card.value)) {
            score += 10;
        } else {
            score += parseInt(card.value);
        }
    }
    // Adjust for aces if necessary
    while (score > 21 && aceCount > 0) {
        score -= 10;
        aceCount--;
    }
    return score;
}

// Display hands and scores
function updateUI() {
    playerHandEl.textContent = playerHand.map(card => `${card.value}${card.suit}`).join(' ');
    dealerHandEl.textContent = dealerHand.map(card => `${card.value}${card.suit}`).join(' ');
    playerScoreEl.textContent = playerScore;
    dealerScoreEl.textContent = dealerScore;
}

// Start a new game
function startNewGame() {
    deck = createDeck();
    shuffleDeck(deck);
    playerHand = [];
    dealerHand = [];
    playerScore = 0;
    dealerScore = 0;
    isGameOver = false;
    resultEl.textContent = '';
    hitBtn.disabled = false;
    standBtn.disabled = false;

    // Deal two cards to each player
    dealCard(playerHand);
    dealCard(dealerHand);
    dealCard(playerHand);
    dealCard(dealerHand);

    // Calculate scores
    playerScore = getHandScore(playerHand);
    dealerScore = getHandScore(dealerHand);

    updateUI();

    if (playerScore === 21) {
        resultEl.textContent = 'Blackjack! You win!';
        isGameOver = true;
        hitBtn.disabled = true;
        standBtn.disabled = true;
    }
}

// Handle hitting (getting another card)
function hit() {
    if (isGameOver) return;

    dealCard(playerHand);
    playerScore = getHandScore(playerHand);

    if (playerScore > 21) {
        resultEl.textContent = 'Busted! You lose!';
        isGameOver = true;
        hitBtn.disabled = true;
        standBtn.disabled = true;
    }

    updateUI();
}

// Handle standing (end of player's turn)
function stand() {
    if (isGameOver) return;

    while (dealerScore < 17) {
        dealCard(dealerHand);
        dealerScore = getHandScore(dealerHand);
    }

    if (dealerScore > 21) {
        resultEl.textContent = 'Dealer Busts! You win!';
    } else if (dealerScore > playerScore) {
        resultEl.textContent = 'Dealer wins!';
    } else if (dealerScore < playerScore) {
        resultEl.textContent = 'You win!';
    } else {
        resultEl.textContent = 'It\'s a tie!';
    }

    isGameOver = true;
    hitBtn.disabled = true;
    standBtn.disabled = true;

    updateUI();
}

// Event listeners
hitBtn.addEventListener("click", hit);
standBtn.addEventListener("click", stand);
newGameBtn.addEventListener("click", startNewGame);

// Start the first game
startNewGame();