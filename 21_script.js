const deal_btn = document.getElementById("deal");
const hit_btn = document.getElementById("hit");
const stand_btn = document.getElementById("stand");
const start_btn = document.getElementById("start");
const dealer_card = document.getElementById("dealer-card");
const player_card = document.getElementById("player-card");
const abutton = document.getElementById("action-buttons");

const cardImg = document.createElement("img");


deal_btn.disabled = true; // Disable deal button initially

deal_btn.addEventListener("click", dealhand);
hit_btn.addEventListener("click", dealcard);
stand_btn.addEventListener("click", stand);
start_btn.addEventListener("click", start);

let deck = [];
let sdeck = [];
ptotal = 0;
dtotal = 0;
canHit = true;
let playerHand = [];
let dealerHand = []; // Initialize dealer's hand
turn = "player"; // Track whose turn it is
pAce = false;
dAce = false;
pjack = false; // Flag to track if player has a blackjack
djack = false; // Flag to track if dealer has a blackjack



function start(){
    console.log("start called");

    document.getElementById("deal").style.display = "none";
    buildDeck();
    dealhand();
    stand_btn.disabled = false; // Enable stand button
    hit_btn.disabled = false; // Enable hit button
    document.getElementById("start-card").style.display = "none"; // Hide start card
}

function buildDeck() {
    console.log("buildDeck called");

    let values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    let types = ["C", "D", "H", "S"];
    deck = [];

    for (let i = 0; i < document.getElementById("decks").value; i++) {
        for (let j = 0; j < types.length; j++) {
            for (let  k= 0; k < values.length; k++) {
                deck.push(values[k] + "-" + types[j]); //A-C -> K-C, A-D -> K-D
            }        
        }
    }

    console.log(deck)
    shuffleDeck();
}

function shuffleDeck() { 
    console.log("shuffleDeck called");

    for (let i = 0; i < deck.length; i++) {
        let j = Math.floor(Math.random() * deck.length); // (0-1) * 52 => (0-51.9999)
        let temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
    console.log("Shuffled deck = " );
    console.log(deck);
  
}

function dealhand() {
    console.log("dealhand called");

    for (let i = 0; i < 2; i++) {
        playerHand.push(deck[0]);
        deck.shift(); // Remove the first card from the deck
        dealerHand.push(deck[0]);
        deck.shift(); // Remove the first card from the deck
    }
    abutton.style.display = "inline"; // Show action buttons
    console.log("Player Hand: " + playerHand);
    console.log("Dealer Hand: " + dealerHand);
    console.log("Deck after dealing: " + deck);

}

function dealcard(){
    if (turn === "player") {
        playerHand.push(deck[0]);
        console.log("Player Hand: " + playerHand);
        deck.shift(); // Remove the first card from the deck
    }
    else if (turn === "dealer") {
        dealerHand.push(deck[0]);
        console.log("Dealer Hand: " + dealerHand);
        deck.shift(); // Remove the first card from the deck
    }
    console.log("Deck after dealing: " + deck);
    
}