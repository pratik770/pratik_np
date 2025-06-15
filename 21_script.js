document.getElementById("deal").addEventListener("click", ready);
document.getElementById("reset").addEventListener("click", reset);
document.getElementById("hit").addEventListener("click", hit);
document.getElementById("stand").addEventListener("click", stand);

let deck = [];
let sdeck = [];
ptotal = 0;
dtotal = 0;
canHit = true;
let playerHand = [];

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

function ready(){
    console.log("Ready...");
    document.getElementById("deal").style.display = "none";
    buildDeck();
    startGame();
}

function startGame() {
    console.log("Starting game...");

    dealhand();

    document.getElementById("action-buttons").style.display = "inline";
    
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
    sdeck=deck;
    console.log("Shuffled deck = " );
    console.log(deck);
    console.log(sdeck);

   
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
            return 11;
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

    // Determine winner
    // if (ptotal > 21) {
    //     document.getElementById("your-sum").innerText = ptotal + "\nBUST!";
    //     alert("You lose!");
    // } else if (dtotal > 21 || ptotal > dtotal) {
    //     alert("You win!");
    // } else if (ptotal < dtotal) {
    //     alert("You lose!");
    // } else {
    //     alert("It's a tie!");
    // }

    showcards();
}

function showcards() {
    console.log("Showing cards...");
    for (let i = 0; i < playerHand.length; i++) {
        let cardImg = document.createElement("img");
        let card = playerHand[i];
        cardImg.src = "./cards/" + card + ".png";
        document.getElementById("your-cards").append(cardImg);
    }

    document.getElementById("hidden").style.display = "none"; // Hide the hidden card
    for (let i = 0; i < dealerHand.length; i++) {

        let cardImg = document.createElement("img");
        let card = dealerHand[i];
        cardImg.src = "./cards/" + card + ".png";
        document.getElementById("dealer-cards").append(cardImg);
    }
}