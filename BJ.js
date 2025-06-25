// app.js

let deck, playerHand, dealerHand, playerBalance = 1000, currentBet = 0;
let playerScore = 0, dealerScore = 0, isGameOver = false;
let splitHands = [];  // Keeps track of split hands

const hitBtn = document.getElementById("hitBtn");
const standBtn = document.getElementById("standBtn");
const doubleDownBtn = document.getElementById("doubleDownBtn");
const splitBtn = document.getElementById("splitBtn");
const newGameBtn = document.getElementById("newGameBtn");
const betAmountEl = document.getElementById("betAmount");
const balanceEl = document.getElementById("balance");
const playerHandEl = document.getElementById("playerHand");
const dealerHandEl = document.getElementById("dealerHand");
const playerScoreEl = document.getElementById("playerScore");
const dealerScoreEl = document.getElementById("dealerScore");
const resultEl = document.getElementById("result");
const placeBetBtn = document.getElementById("placeBetBtn");

// Initialize deck
const suits = ['♠', '♣', '♦', '♥'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function createDeck() {
    let deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit: suit, value: value });
        }
    }
    return deck;
}

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

// Get hand score
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

// Update UI
function updateUI() {
    playerHandEl.textContent = playerHand.map(card => `${card.value}${card.suit}`).join(' ');
    dealerHandEl.textContent = dealerHand.map(card => `${card.value}${card.suit}`).join(' ');
    playerScoreEl.textContent = playerScore;
    dealerScoreEl.textContent = dealerScore;
    balanceEl.textContent = playerBalance;
}

// Handle placing a bet
function placeBet() {
    const betAmount = parseInt(betAmountEl.value);
    if (betAmount > 0 && betAmount <= playerBalance) {
        currentBet = betAmount;
        playerBalance -= currentBet;
        updateUI();
        startGame();
    } else {
        alert('Invalid bet amount');
    }
}

// Start a new game
function startGame() {
    deck = createDeck();
    shuffleDeck(deck);
    playerHand = [];
    dealerHand = [];
    splitHands = [];
    playerScore = 0;
    dealerScore = 0;
    isGameOver = false;
    resultEl.textContent = '';
    
    // Deal initial cards
    dealCard(playerHand);
    dealCard(dealerHand);
    dealCard(playerHand);
    dealCard(dealerHand);

    playerScore = getHandScore(playerHand);
    dealerScore = getHandScore(dealerHand);

    updateUI();

    // Check for Blackjack or pair for splitting
    if (playerScore === 21) {
        resultEl.textContent = 'Blackjack! You win!';
        playerBalance += currentBet * 2.5;
        isGameOver = true;
    }

    if (playerHand[0].value === playerHand[1].value) {
        splitBtn.disabled = false;
    }

    hitBtn.disabled = false;
    standBtn.disabled = false;
    doubleDownBtn.disabled = false;
    newGameBtn.disabled = false;
}

// Handle hitting (drawing a card)
function hit() {
    if (isGameOver) return;
    dealCard(playerHand);
    playerScore = getHandScore(playerHand);

    if (playerScore > 21) {
        resultEl.textContent = 'Busted! You lose!';
        playerBalance -= currentBet;
        isGameOver = true;
    }

    updateUI();
}

// Handle standing
function stand() {
    if (isGameOver) return;

    while (dealerScore < 17) {
        dealCard(dealerHand);
        dealerScore = getHandScore(dealerHand);
    }

    if (dealerScore > 21) {
        resultEl.textContent = 'Dealer Busts! You win!';
        playerBalance += currentBet * 2;
    } else if (dealerScore > playerScore) {
        resultEl.textContent = 'Dealer wins!';
        playerBalance -= currentBet;
    } else if (dealerScore < playerScore) {
        resultEl.textContent = 'You win!';
        playerBalance += currentBet * 2;
    } else {
        resultEl.textContent = 'It\'s a tie!';
        playerBalance += currentBet;
    }

    isGameOver = true;
    updateUI();
}

// Handle doubling down
function doubleDown() {
    if (isGameOver) return;

    if (playerBalance >= currentBet) {
        playerBalance -= currentBet;
        currentBet *= 2;
        dealCard(playerHand);
        playerScore = getHandScore(playerHand);
        
        if (playerScore > 21) {
            resultEl.textContent = 'Busted! You lose!';
            playerBalance -= currentBet;
        }

        updateUI();
    }
}

// Handle splitting
function split() {
    if (isGameOver || playerHand[0].value !== playerHand[1].value) return;

    let hand1 = [playerHand[0]];
    let hand2 = [playerHand[1]];
    
    splitHands.push({ hand: hand1, bet: currentBet });
    splitHands.push({ hand: hand2, bet: currentBet });

    playerHand = [];
    dealCard(hand1);
    dealCard(hand2);
    dealCard(playerHand);
    
    updateUI();

    // Enable options for each hand
    hitBtn.disabled = false;
    standBtn.disabled = false;
    doubleDownBtn.disabled = false;
    splitBtn.disabled = true; // Can't split after splitting
}

// Event Listeners
placeBetBtn.addEventListener("click", placeBet);
hitBtn.addEventListener("click", hit);
standBtn.addEventListener("click", stand);
doubleDownBtn.addEventListener("click", doubleDown);
splitBtn.addEventListener("click", split);
newGameBtn.addEventListener("click", () => location.reload());

// Disable buttons on load
splitBtn.disabled = true;
hitBtn.disabled = true;
standBtn.disabled = true;
doubleDownBtn.disabled = true;
newGameBtn.disabled = true;