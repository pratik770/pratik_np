document.getElementById("deal").addEventListener("click", dealhand);
document.getElementById("reset").addEventListener("click", reset);
document.getElementById("hit").addEventListener("click", hit);
document.getElementById("stand").addEventListener("click", stand);
document.getElementById("start").addEventListener("click", start);
document.getElementById("deal").disabled = true; // Disable deal button initially
document.getElementById("reset").disabled = true; // Disable reset button initially

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
    pbust = false; // Reset player bust flag

    document.getElementById("your-sum").innerText = "";
    document.getElementById("dealer-sum").innerText = "";

}

function start(){

    console.log("Starting...");
    document.getElementById("deal").style.display = "none";
    buildDeck();
    dealhand();
    document.getElementById("start").disabled = true; // Disable start button after starting the game
    document.getElementById("deal").disabled = false; // Enable deal button initially
    // document.getElementById("reset").disabled = false; // Enable reset button initially

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
    dealerHand=[];
    turn = "player"; // Track whose turn it is
    document.getElementById("your-cards").innerHTML = ""; // Clear player cards
    document.getElementById("dealer-cards").innerHTML = '<img id="hidden" src="./cards/BACK.png">'; // Clear dealer cards
    console.log("New game started");
}

function dealhand() {
    console.log("dealhand called");
    dealing = true; // Set dealing to true

    newgame();
    document.getElementById("action-buttons").style.display = "inline";
    document.getElementById("deal").style.display = "none"; // Hide deal button

    for (let i = 0; i < 2; i++) {

        turn = "player"; // Set turn to player
        playerHand.push(deck[0]);
        ptotal += getValue(deck[0]); // Get the value of the card
        document.getElementById("your-sum").innerText = ptotal;
        console.log("Deal hand to player: " + ptotal);
        console.log("Player Hand: ", playerHand);
        deck.shift(); // Remove the dealt cards from the deck


        turn = "dealer"; // Set turn to dealer
        dealerHand.push(deck[0]);
        dtotal += getValue(deck[0]); // Get the value of the card
        document.getElementById("dealer-sum").innerText = getValue(dealerHand[0]);
        console.log("Dealer Hand: ", dealerHand);
        console.log("Deal hand to dealer: " + dtotal);
        deck.shift(); // Remove the dealt cards from the deck
        
    }
    
    showcards(); // Show the cards after dealing

    console.log("remaining deck: ");
    console.log(deck);
    dealing = false; // Set dealing to false
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

    turn = "player";

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
        pbust = true; // Set player bust flag
        dealerTurn(); // Start dealer's turn
        
    } else if (ptotal === 21) {
        stand(); // Automatically stand if player hits 21
        // document.getElementById("hit").disabled = true; // Disable hit button
    }

}

function stand(){
    console.log("Stand called with hand: ");
    canHit = false;
    document.getElementById("action-buttons").style.display = "none"; // Hide action buttons

    pbust = false; // Reset player bust flag

    dealerTurn(); // Start dealer's turn

    console.log("Dealer's final hand: ", dealerHand);

    document.getElementById("dealer-sum").innerText = dtotal;

    document.getElementById("deal").style.display = "inline"; // Show deal button


}

function dealerTurn() {
    console.log("Dealer's turn started...");

    turn = "dealer"; // Set turn to dealer

    while(dtotal < 17 && pbust === false) {
        dealerHand.push(deck[0]);
        dtotal += getValue(deck[0]); // Get the value of the card
        console.log("Dealt card to dealer: " + dtotal);
        deck.shift(); // Remove the dealt cards from the deck

    }
    if (dtotal < 17 && pbust === true) {
        console.log("Dealer stands with total: " + dtotal);
    }

    document.getElementById("dealer-cards").innerHTML = ""; // Clear dealer cards
    showcards();
    console.log("Dealer's final hand: ", dealerHand);
    document.getElementById("dealer-sum").innerText = dtotal;

    // Show dealer's cards
   
}

function showcards() {
    console.log("Showing cards...");

    if (dealing) {
        for (let i = 0; i < playerHand.length; i++) {
            let cardImg = document.createElement("img");
            let card = playerHand[i]; // Get the last card dealt to the player
            cardImg.src = "./cards/" + card + ".png";
            document.getElementById("your-cards").append(cardImg);
            console.log("Show card to player && dealing true: ");
        }
    
        let cardImg = document.createElement("img");
        let card = dealerHand[0];
        cardImg.src = "./cards/" + card + ".png";
        document.getElementById("dealer-cards").append(cardImg);
        console.log("Show card to dealing && dealing: ");

    }

    if(!dealing && turn == "player") {
        let cardImg = document.createElement("img");
        let card = playerHand[playerHand.length -1]; // Get the last card dealt to the player
        cardImg.src = "./cards/" + card + ".png";
        document.getElementById("your-cards").append(cardImg);
        console.log("Show card to player && dealing true: ");

    }

    if(!dealing && turn == "dealer") {
        for (let i = 0; i < dealerHand.length; i++) {
            let cardImg = document.createElement("img");
            let card = dealerHand[i]; // Get the last card dealt to the player
            cardImg.src = "./cards/" + card + ".png";
            document.getElementById("dealer-cards").append(cardImg);
            console.log("Show card to dealer && dealing true: ");
        }
    }


    
    
}