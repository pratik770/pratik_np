// Buttons and Initial Setup
document.getElementById("deal").addEventListener("click", dealhand);
document.getElementById("hit").addEventListener("click", hit);
document.getElementById("stand").addEventListener("click", stand);
document.getElementById("start").addEventListener("click", start);
document.getElementById("deal").disabled = true; // Disable deal button initially

// Initialize variables
let deck = [];
let playerHand = [];
let dealerHand = [];
let ptotal = 0, dtotal = 0;
let canHit = true;
let turn = "player"; // Track whose turn it is
let pAce = false, dAce = false, pbust = false;
let pjack = false, djack = false;
let dealing = false; // Track if dealing is in progress
let bankroll = 1000; // Player's available money (can be changed based on your preference)
let bet = 0; // Player's bet amount

// Display Bankroll
document.getElementById("bankroll").innerText = `Bankroll: $${bankroll}`;

function reset() {
    document.getElementById("deal").style.display = "inline";
    document.getElementById("action-buttons").style.display = "none";
    ptotal = 0;
    dtotal = 0;
    canHit = true;
    playerHand = [];
    dealerHand = [];
    pbust = false;
    bet = 0;

    document.getElementById("your-sum").innerText = "";
    document.getElementById("dealer-sum").innerText = "";
    document.getElementById("bet-amount").innerText = `Bet: $${bet}`;
}

function start() {
    console.log("Starting...");
    let betAmount = parseInt(document.getElementById("bet-input").value);
    
    if (isNaN(betAmount) || betAmount <= 0 || betAmount > bankroll) {
        alert("Please enter a valid bet amount.");
        return;
    }

    bet = betAmount;
    bankroll -= bet;
    document.getElementById("bankroll").innerText = `Bankroll: $${bankroll}`;
    document.getElementById("bet-amount").innerText = `Bet: $${bet}`;

    document.getElementById("deal").style.display = "none";
    buildDeck();
    dealhand();
    document.getElementById("start").disabled = true;
    document.getElementById("deal").disabled = false;
    document.getElementById("start-card").style.display = "none";
}

function buildDeck() {
    console.log("Building deck...");
    let values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    let types = ["C", "D", "H", "S"];
    deck = [];

    for (let i = 0; i < document.getElementById("decks").value; i++) {
        for (let type of types) {
            for (let value of values) {
                deck.push(value + "-" + type);
            }
        }
    }
    console.log(deck);
    shuffleDeck();
}

function shuffleDeck() {
    for (let i = 0; i < deck.length; i++) {
        let j = Math.floor(Math.random() * deck.length);
        let temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
    console.log("Shuffled deck:", deck);
}

function newgame() {
    ptotal = 0;
    dtotal = 0;
    canHit = true;
    playerHand = [];
    dealerHand = [];
    turn = "player";
    pAce = false;
    dAce = false;
    pjack = false;
    djack = false;

    document.getElementById("your-cards").innerHTML = "";
    document.getElementById("dealer-cards").innerHTML = '<img id="hidden" src="./cards/BACK.png">';
    console.log("New game started");
}

function dealhand() {
    if (dealing) return; // Prevent multiple clicks while dealing
    dealing = true;
    console.log("dealhand called");

    newgame();
    document.getElementById("action-buttons").style.display = "inline";
    document.getElementById("deal").style.display = "none";

    for (let i = 0; i < 2; i++) {
        turn = "player";
        playerHand.push(deck.shift());
        ptotal += getValue(playerHand[playerHand.length - 1]);

        if (pAce) {
            checkBJ();
            document.getElementById("your-sum").innerText = ptotal + "/" + (ptotal + 10);
        } else {
            document.getElementById("your-sum").innerText = ptotal;
        }

        console.log("Player Hand:", playerHand, "Total:", ptotal);

        turn = "dealer";
        dealerHand.push(deck.shift());
        dtotal += getValue(dealerHand[dealerHand.length - 1]);

        if (dAce) {
            checkBJ();
            document.getElementById("dealer-sum").innerText = dtotal + "/" + (dtotal + 10);
        } else {
            document.getElementById("dealer-sum").innerText = dtotal;
        }

        console.log("Dealer Hand:", dealerHand, "Total:", dtotal);
    }

    showcards();

    if (pjack || djack) {
        handend();
    }
    dealing = false;
}

function getValue(card) {
    let data = card.split("-");
    let value = data[0];

    if (isNaN(value)) {
        if (value == "A") {
            if (turn === "player") pAce = true;
            else if (turn === "dealer") dAce = true;
            return 1;
        }
        return 10;
    }
    return parseInt(value);
}

function hit() {
    if (!canHit) return;

    turn = "player";
    playerHand.push(deck.shift());
    ptotal += getValue(playerHand[playerHand.length - 1]);

    if (pAce && ptotal < 11) {
        document.getElementById("your-sum").innerText = ptotal + "/" + (ptotal + 10);
    } else {
        document.getElementById("your-sum").innerText = ptotal;
    }

    console.log("Player Hand:", playerHand, "Total:", ptotal);

    showcards();

    if (ptotal > 21) {
        console.log("Player busts!");
        document.getElementById("your-sum").innerText = ptotal + "\nBUST!";
        canHit = false;
        document.getElementById("action-buttons").style.display = "none";
        document.getElementById("deal").style.display = "inline";
        pbust = true;
        dealerTurn();
    } else if (ptotal === 21) {
        stand();
    }
}

function stand() {
    console.log("Stand called with hand:", playerHand);
    canHit = false;
    document.getElementById("action-buttons").style.display = "none";
    dealerTurn();
}

function dealerTurn() {
    console.log("Dealer's turn started...");

    turn = "dealer";
    if (pbust) return;

    while (dtotal < 17) {
        dealerHand.push(deck.shift());
        dtotal += getValue(dealerHand[dealerHand.length - 1]);
        console.log("Dealt card to dealer:", dtotal);
    }

    document.getElementById("dealer-cards").innerHTML = "";
    showcards();
    console.log("Dealer's final hand:", dealerHand);
    document.getElementById("dealer-sum").innerText = dtotal;

    handend();
}

function showcards() {
    console.log("Showing cards...");
    // Player's cards
    playerHand.forEach(card => {
        let cardImg = document.createElement("img");
        cardImg.src = "./cards/" + card + ".png";
        document.getElementById("your-cards").append(cardImg);
    });

    // Dealer's cards
    dealerHand.forEach((card, index) => {
        let cardImg = document.createElement("img");
        if (index === 0 && dealing) {
            cardImg.src = "./cards/BACK.png"; // Show hidden card
        } else {
            cardImg.src = "./cards/" + card + ".png";
        }
        document.getElementById("dealer-cards").append(cardImg);
    });
}

function checkBJ() {
    if (ptotal === 21) {
        console.log("Player has a Blackjack!");
        pjack = true;
        document.getElementById("results").innerText = "Player Blackjack!";
    }
    if (dtotal === 21) {
        console.log("Dealer has a Blackjack!");
        djack = true;
        document.getElementById("results").innerText = "Dealer Blackjack!";
    }
}

function handend() {
    console.log("Hand ended");

    let payout = 0;
    if (pjack && djack) {
        document.getElementById("results").innerText = "Push! Both have Blackjack!";
        payout = 0; // No payout for a push
    } else if (pjack) {
        document.getElementById("results").innerText = "Player wins with Blackjack!";
        payout = bet * 1.5; // Blackjack payout (1.5x)
    } else if (djack) {
        document.getElementById("results").innerText = "Dealer wins with Blackjack!";
        payout = -bet; // Dealer wins
    } else if (ptotal > 21) {
        document.getElementById("results").innerText = "Player Busts! Dealer Wins!";
        payout = -bet; // Player busts
    } else if (dtotal > 21 || ptotal > dtotal) {
        document.getElementById("results").innerText = "Player Wins!";
        payout = bet; // Player wins
    } else if (ptotal < dtotal) {
        document.getElementById("results").innerText = "Dealer Wins!";
        payout = -bet; // Dealer wins
    } else {
        document.getElementById("results").innerText = "Push!";
        payout = 0; // Push
    }

    bankroll += payout;
    document.getElementById("bankroll").innerText = `Bankroll: $${bankroll}`;
    document.getElementById("deal").style.display = "inline"; // Show deal button
}