document.getElementById("deal").addEventListener("click", ready);
document.getElementById("reset").addEventListener("click", reset);

let deck = [];

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
    document.getElementById("action-buttons").style.display = "block";
    
    // Additional game setup logic can go here
    // For example, initializing player hands, scores, etc.
    
    // Example: Initialize player hands
    playerHand = [];
    dealerHand = [];
    
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