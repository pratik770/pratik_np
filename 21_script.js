document.getElementById("deal").addEventListener("click", ready);
document.getElementById("reset").addEventListener("click", reset);

let deck = [];
ptotal = 0;
dtotal = 0;

function reset() {
    
    document.getElementById("action-buttons").style.display = "none";
    document.getElementById("deal").style.display = "block";

}


function ready(){
    console.log("Ready...");
    document.getElementById("deal").style.display = "none";
    buildDeck();
    startGame();
}

function startGame() {
    console.log("Starting game...");

    dealhand();

    document.getElementById("action-buttons").style.display = "block";
    
    // Additional game setup logic can go here
    // For example, initializing player hands, scores, etc.
    
    // Example: Initialize player hands
   
   
    // Deal initial cards to player and dealer
    // dealInitialCards();
}

function buildDeck() {

    console.log("Building deck...");

    let values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    let types = ["C", "D", "H", "S"];
    deck = [];

    
    for (let i = 0; i < types.length; i++) {
        for (let j = 0; j < values.length; j++) {
            deck.push(values[j] + "-" + types[i]); //A-C -> K-C, A-D -> K-D
        }        
    }
    
    console.log(deck)
    shuffleDeck();
}


function shuffleDeck() {
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
    playerHand = [];
    dealerHand = [];
    
    for (let i = 0; i < 2; i++) {

        playerHand.push(deck[0]);
        ptotal += getValue(deck[0]); // Get the value of the card
        document.getElementById("your-sum").innerText = ptotal;
        console.log("Dealt card to player: " + ptotal);
        deck.shift(); // Remove the dealt cards from the deck


        dealerHand.push(deck[0]);
        dtotal += getValue(deck[0]); // Get the value of the card
        console.log("Dealt card to dealer: " + dtotal);
        deck.shift(); // Remove the dealt cards from the deck


        console.log("Player Hand: ", playerHand);
        console.log("Dealer Hand: ", dealerHand);
    }
    
}

function getValue(card) {
    let data = card.split("-"); // "4-C" -> ["4", "C"]
    let value = data[0];

    if (isNaN(value)) { //A J Q K
        if (value == "A") {
            return 11;
        }
        return 10;
    }
    return parseInt(value);
}