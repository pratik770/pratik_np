document.getElementById("deal").addEventListener("click", dealhand);
document.getElementById("reset").addEventListener("click", reset);
document.getElementById("hit").addEventListener("click", hit);
document.getElementById("stand").addEventListener("click", stand);
document.getElementById("start").addEventListener("click", start);

let deck = [];
let sdeck = [];
ptotal = 0;
dtotal = 0;
canHit = true;
let playerHand = [];
let dealerHand = []; // Initialize dealer's hand
turn = "player"; // Track whose turn it is

// window.onload = function() {
//     document.getElementsByClassName("btn").disabled = true; // Enable all buttons on page load
// }

function reset() {
    
   
    document.getElementById("deal").style.display = "inline";
    document.getElementById("action-buttons").style.display = "none";
    let deck = [];
    let sdeck = [];
    ptotal = 0;
    dtotal = 0;
    canHit = true;
    let playerHand = [];

    document.getElementById("your-sum").innerText = "";
    document.getElementById("dealer-sum").innerText = "";



}

function start(){
    console.log("Ready...");
    document.getElementById("deal").style.display = "none";
    buildDeck();
    startGame();
    document.getElementById("start").disabled = true; // Disable start button after starting the game
}

function startGame() {
    console.log("Starting game...");

    dealhand();

    
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

    for (let i = 0; i < document.getElementById("decks").value; i++) {
        for (let i = 0; i < types.length; i++) {
            for (let j = 0; j < values.length; j++) {
                deck.push(values[j] + "-" + types[i]); //A-C -> K-C, A-D -> K-D
            }        
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
    sdeck=deck;
    console.log("Shuffled deck = " );
    console.log(deck);
    console.log(sdeck);

   
}

function newgame(){
    ptotal = 0;
    dtotal = 0;
    canHit = true;
    playerHand = [];
    dealerhand=[];
    turn = "player"; // Track whose turn it is
    document.getElementById("your-cards").innerHTML = ""; // Clear player cards

}

function dealhand() {
    console.log("dealhand called");

    newgame();
    document.getElementById("action-buttons").style.display = "inline";
    document.getElementById("deal").style.display = "none"; // Hide deal button


    // document.getElementById("your-cards").style.width = "50%"; // Clear player cards 
    // document.getElementById("your-cards").style.height = "50%"; // Clear player cards   

    for (let i = 0; i < 2; i++) {

        playerHand.push(deck[0]);
        ptotal += getValue(deck[0]); // Get the value of the card
        document.getElementById("your-sum").innerText = ptotal;
        console.log("Dealt card to player: " + ptotal);
        showcards(); // Show the cards after dealing
        deck.shift(); // Remove the dealt cards from the deck


        dealerHand.push(deck[0]);
        dtotal += getValue(deck[0]); // Get the value of the card
        document.getElementById("dealer-sum").innerText = getValue(dealerHand[0]);
        console.log("Dealt card to dealer: " + dtotal);
        deck.shift(); // Remove the dealt cards from the deck


        console.log("Player Hand: ", playerHand);
        console.log("Dealer Hand: ", dealerHand);
    }
    
    console.log("remaining deck: ");
    console.log(deck);
}

function getValue(card) {
    let data = card.split("-"); // "4-C" -> ["4", "C"]
    let value = data[0];

    if (isNaN(value)) { //A J Q K
        if (value == "A") {
            return 1;
        }
        return 10;
    }
    return parseInt(value);
}

function hit() {

    console.log("Hit called with hand: ");
    if (!canHit) {
        return;
    }

    playerHand.push(deck[0]);
    ptotal += getValue(deck[0]); // Get the value of the card
    document.getElementById("your-sum").innerText = ptotal;
    console.log("Player total: " + ptotal);
    

    console.log("Dealt card to player: ");
    console.log(playerHand);  
    deck.shift(); // Remove the dealt cards from the deck

    console.log(deck);  

    showcards(); // Show the cards after hitting

    if (ptotal > 21) {
        console.log("Player busts! Total: " + ptotal);
        document.getElementById("your-sum").innerText = ptotal + "\nBUST!";
        canHit = false;
        document.getElementById("action-buttons").style.display = "none"; // Hide action buttons
        document.getElementById("deal").style.display = "inline"; // Show deal button
        // document.getElementById("hit").disabled = true; // Disable hit button
    } else if (ptotal === 21) {
        
        canHit = false;
        // document.getElementById("hit").disabled = true; // Disable hit button
    }

}

function stand(){
    console.log("Stand called with hand: ");
    canHit = false;
    document.getElementById("action-buttons").style.display = "none"; // Hide action buttons
    document.getElementById("deal").style.display = "inline"; // Show deal button

    // Dealer's turn logic
    while (dtotal < 17) {
        dealerHand.push(deck[0]);
        dtotal += getValue(deck[0]); // Get the value of the card
        deck.shift(); // Remove the dealt cards from the deck
        console.log("Dealt card to dealer: " + dtotal);
    }

    console.log("Dealer's final hand: ", dealerHand);

    document.getElementById("dealer-sum").innerText = dtotal;

}

function showcards() {
    console.log("Showing cards...");
    if (turn == "player") {
        // for (let i = 0; i < playerHand.length; i++) {
            let cardImg = document.createElement("img");
            let card = playerHand[playerHand.length - 1]; // Get the last card dealt to the player
            cardImg.src = "./cards/" + card + ".png";
            document.getElementById("your-cards").append(cardImg);
        // }
    }


    if (turn == "dealer") {

        document.getElementById("hidden").style.display = "none"; // Hide the hidden card

        for (let i = 0; i < dealerHand.length; i++) {

            let cardImg = document.createElement("img");
            let card = dealerHand[i];
            cardImg.src = "./cards/" + card + ".png";
            document.getElementById("dealer-cards").append(cardImg);
        }
    }
}