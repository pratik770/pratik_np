let deck = [];
let suits = ['hearts', 'diamonds', 'clubs', 'spades'];
let values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

let playerHands = [[]];  // Array of hands, supports split
let dealerHand = [];
let currentHandIndex = 0;  // To track which hand the player is playing

let playerChoseDoubleDown = false;

function createDeck(numDecks) {
    deck = [];
    for (let i = 0; i < numDecks; i++) {
        for (let suit of suits) {
            for (let value of values) {
                deck.push({ value: value, suit: suit });
            }
        }
    }
}

function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function startGame() {
    playerHands = [[]];  // Reset player hands
    dealerHand = [];
    currentHandIndex = 0;
    playerChoseDoubleDown = false;

    const numDecks = parseInt(document.getElementById('num-decks').value);
    createDeck(numDecks);
    shuffleDeck();
    
    dealCards();
    updateGameState();
    enableControls();
}

function dealCards() {
    playerHands[0].push(deck.pop(), deck.pop());
    dealerHand.push(deck.pop(), deck.pop());
}

function getHandValue(hand) {
    let value = 0;
    let aceCount = 0;

    hand.forEach(card => {
        if (card.value === 'A') {
            aceCount++;
            value += 11;
        } else if (['K', 'Q', 'J'].includes(card.value)) {
            value += 10;
        } else {
            value += parseInt(card.value);
        }
    });

    while (value > 21 && aceCount) {
        value -= 10;
        aceCount--;
    }

    return value;
}

function updateGameState() {
    document.getElementById('player-cards').textContent = playerHands[currentHandIndex].map(card => `${card.value} of ${card.suit}`).join(', ');
    document.getElementById('player-score').textContent = `Score: ${getHandValue(playerHands[currentHandIndex])}`;

    document.getElementById('dealer-cards').textContent = dealerHand.map(card => `${card.value} of ${card.suit}`).join(', ');
    document.getElementById('dealer-score').textContent = `Score: ${getHandValue(dealerHand)}`;
}

function hit() {
    playerHands[currentHandIndex].push(deck.pop());
    updateGameState();
    checkGameStatus();
}

function stand() {
    if (currentHandIndex < playerHands.length - 1) {
        currentHandIndex++;
        updateGameState();
    } else {
        while (getHandValue(dealerHand) < 17) {
            dealerHand.push(deck.pop());
            updateGameState();
        }
        checkGameStatus();
    }
}

function doubleDown() {
    if (!playerChoseDoubleDown) {
        playerChoseDoubleDown = true;
        playerHands[currentHandIndex].push(deck.pop());
        updateGameState();
        stand();
    }
}

function split() {
    if (playerHands[currentHandIndex].length === 2 && playerHands[currentHandIndex][0].value === playerHands[currentHandIndex][1].value) {
        const newHand = [playerHands[currentHandIndex].pop()];
        playerHands.push(newHand);
        playerHands[currentHandIndex].push(deck.pop());
        playerHands[playerHands.length - 1].push(deck.pop());
        updateGameState();
        currentHandIndex = playerHands.length - 1;
        enableControls();
    }
}

function checkGameStatus() {
    const playerScore = getHandValue(playerHands[currentHandIndex]);
    const dealerScore = getHandValue(dealerHand);

    if (playerScore > 21) {
        document.getElementById('game-result').textContent = "You busted! Dealer wins.";
    } else if (dealerScore > 21) {
        document.getElementById('game-result').textContent = "Dealer busted! You win.";
    } else if (playerScore === 21) {
        document.getElementById('game-result').textContent = "Blackjack! You win.";
    } else if (dealerScore === 21) {
        document.getElementById('game-result').textContent = "Dealer has Blackjack! Dealer wins.";
    } else if (playerScore === dealerScore) {
        document.getElementById('game-result').textContent = "It's a tie!";
    } else if (playerScore > dealerScore) {
        document.getElementById('game-result').textContent = "You win!";
    } else {
        document.getElementById('game-result').textContent = "Dealer wins!";
    }
}

function enableControls() {
    document.getElementById('hit-btn').disabled = false;
    document.getElementById('stand-btn').disabled = false;
    document.getElementById('double-btn').disabled = false;
    document.getElementById('split-btn').disabled = false;
}

document.getElementById('hit-btn').addEventListener('click', hit);
document.getElementById('stand-btn').addEventListener('click', stand);
document.getElementById('double-btn').addEventListener('click', doubleDown);
document.getElementById('split-btn').addEventListener('click', split);
document.getElementById('start-btn').addEventListener('click', startGame);

window.onload = () => {
    document.getElementById('start-btn').disabled = false;
};