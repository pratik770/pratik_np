document.getElementById("deal").addEventListener("click", dealhand);
// document.getElementById("reset").addEventListener("click", reset);
document.getElementById("hit").addEventListener("click", hit);
document.getElementById("stand").addEventListener("click", stand);
document.getElementById("start").addEventListener("click", start);
document.getElementById("deal").disabled = true; // Disable deal button initially
// document.getElementById("reset").disabled = true; // Disable reset button initially

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
ace = false; // Flag to track if an Ace is present
pjack = false; // Flag to track if player has a blackjack
djack = false; // Flag to track if dealer has a blackjack

// window.onload = function() {
//     document.getElementsByClassName("btn").disabled = true; // Enable all buttons on page load
// }

function reset() {
    console.log("Reset called");

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
    console.log("start called");

    document.getElementById("deal").style.display = "none";
    buildDeck();
    dealhand();
    document.getElementById("start").disabled = true; // Disable start button after starting the game
    document.getElementById("deal").disabled = false; // Enable deal button initially
    document.getElementById("start-card").style.display = "none"; // Hide start card
    // document.getElementById("reset").disabled = false; // Enable reset button initially

}

function buildDeck() {
    console.log("buildDeck called");

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
    console.log("shuffleDeck called");

    for (let i = 0; i < deck.length; i++) {
        let j = Math.floor(Math.random() * deck.length); // (0-1) * 52 => (0-51.9999)
        let temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
    // sdeck=deck;
    console.log("Shuffled deck = " );
    console.log(deck);
    // console.log(sdeck);

   
}

function newgame(){
    console.log("newgame called");

    ptotal = 0;
    dtotal = 0;
    canHit = true;
    playerHand = [];
    dealerHand=[];
    turn = "player"; // Track whose turn it is
    document.getElementById("your-cards").innerHTML = ""; // Clear player cards
    document.getElementById("dealer-cards").innerHTML = '<img id="hidden" src="./cards/BACK.png">'; // Clear dealer cards
    document.getElementById("results").innerText = ""; // Clear results text
    pAce = false; // Reset player ace flag
    dAce = false; // Reset dealer ace flag
    pjack = false; // Reset player blackjack flag
    djack = false; // Reset dealer blackjack flag
}

function dealhand() {
    console.log("dealhand called");

    dealing = true; // Set dealing to true

    newgame();

    deck = ["A-C", "A-D", "2-C", "5-D","A-C", "8-D", "K-C", "K-D","A-C", "A-D", "K-C", "K-D" ]
    document.getElementById("action-buttons").style.display = "inline";
    document.getElementById("deal").style.display = "none"; // Hide deal button

    for (let i = 0; i < 2; i++) {

        turn = "player"; // Set turn to player
        playerHand.push(deck[0]);
        ptotal += getValue(deck[0]); // Get the value of the card
        if (pAce === true){
            checkBJ(); // Check if player has a blackjack
            document.getElementById("your-sum").innerText = ptotal + "/" + (ptotal + 10); // Show both values of Ace
        }
        else{
            document.getElementById("your-sum").innerText = ptotal;
        }
        console.log("Player Hand: ", playerHand);
        deck.shift(); // Remove the dealt cards from the deck


        turn = "dealer"; // Set turn to dealer
        dealerHand.push(deck[0]);
        dtotal += getValue(deck[0]); // Get the value of the card
        console.log("Dealer Ace: " + dAce);
        if (dAce === true){
            checkBJ(); // Check if player has a blackjack
            if (djack === true) {
                document.getElementById("results").innerText = "Dealer Blackjack!";
                document.getElementById("dealer-sum").innerText = dtotal + "/" + (dtotal + 10); // Show both values of Ace
            }
            else{
                document.getElementById("dealer-sum").innerText = getValue(dealerHand[0])+ "/" + (getValue(dealerHand[0]) + 10); // Show both values of Ace 

            }
        }
        else {
            document.getElementById("dealer-sum").innerText = getValue(dealerHand[0]);
        }
        // document.getElementById("dealer-sum").innerText = getValue(dealerHand[0]);
        console.log("Dealer Hand: ", dealerHand);
        console.log("Deal hand to dealer: " + dtotal);
        deck.shift(); // Remove the dealt cards from the deck   
    }
    
    if (pjack === true || djack === true) {
        handend(); // End the hand if either player or dealer has a blackjack
    }
    showcards(); // Show the cards after dealing
    
    console.log("remaining deck: ");
    console.log(deck);
    dealing = false; // Set dealing to false
}

function getValue(card) {
    console.log("getValue called by " + turn);

    let data = card.split("-"); // "4-C" -> ["4", "C"]
    let value = data[0];

    if (isNaN(value)) { //A J Q K
        if (value == "A") {
            if (turn == "player" ){
                pAce = true; // Set player ace flag
            }
            else if (turn == "dealer") {
                dAce = true; // Set dealer ace flag
            }
            return 1;
        }
        return 10;
    }
    return parseInt(value);
    
}

function hit() {
    console.log("Hit called");

    if (!canHit) {
        return;
    }

    turn = "player";

    playerHand.push(deck[0]);
    ptotal += getValue(deck[0]); // Get the value of the card
    if (pAce === true && ptotal < 11) {
        document.getElementById("your-sum").innerText = ptotal + "/" + (ptotal + 10); // Show both values of Ace
    }
    else{
        document.getElementById("your-sum").innerText = ptotal;
    }
    // document.getElementById("your-sum").innerText = ptotal;
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
    console.log("Stand called: ");

    canHit = false;
    document.getElementById("action-buttons").style.display = "none"; // Hide action buttons

    if (pAce === true && ptotal < 11) {
        document.getElementById("your-sum").innerText = (ptotal + 10); // Show both values of Ace
    }
    pbust = false; // Reset player bust flag

    dealerTurn(); // Start dealer's turn

    console.log("Dealer's final hand: ", dealerHand);

    document.getElementById("dealer-sum").innerText = dtotal;

    document.getElementById("deal").style.display = "inline"; // Show deal button


}

function dealerTurn() {
    console.log("dealerTurn called " + dtotal);

    turn = "dealer"; // Set turn to dealer

     if (pbust === true) {
        console.log("Dealer stands with total: " + dtotal);
    }

    while(dtotal < 17 && pbust === false) {
        if (dAce === true && dtotal < 11) {
            // dtotal += 10;
            console.log("Dealer Ace adjusted: " + dtotal);
        }
        else if (dtotal < 17) {
            dealerHand.push(deck[0]);
            dtotal += getValue(deck[0]); // Get the value of the card
            console.log("Dealt card to dealer: " + dtotal);
            deck.shift(); // Remove the dealt cards from the deck
        }
    }

    if(pjack === false || djack === false) {

        document.getElementById("dealer-cards").innerHTML = ""; // Clear dealer cards
        showcards();
        console.log("Dealer's final hand: ", dealerHand);
        document.getElementById("dealer-sum").innerText = dtotal;
    }

    // Show dealer's cards
   
}

function showcards() {
    console.log("Showcards called");

    if (dealing && pjack === false && djack === false) {
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
    else if (dealing && (pjack === true || djack === true)) {
        for (let i = 0; i < playerHand.length; i++) {
            let cardImg = document.createElement("img");
            let card = playerHand[i]; // Get the last card dealt to the player
            cardImg.src = "./cards/" + card + ".png";
            document.getElementById("your-cards").append(cardImg);
            console.log("Show card to player && dealing true: ");
        
    
            cardImg = document.createElement("img");
            card = dealerHand[i];
            cardImg.src = "./cards/" + card + ".png";
            document.getElementById("dealer-cards").append(cardImg);
            console.log("Show card to dealing && dealing: ");
        }


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

function checkBJ(){
    console.log("checkBJ called by " + turn);

    if (pAce === true && ptotal === 11) {
        console.log("Player has a Blackjack!");
        document.getElementById("results").innerText = "Player Blackjack!";
        pjack = true; // Set player blackjack flag
    }
    if (dAce === true && dtotal === 11) {
        console.log("Dealer has a Blackjack!");
        document.getElementById("results").innerText = "Dealer Blackjack!";
        djack = true; // Set dealer blackjack flag
    }    
}

function handend() {
    console.log("Handend called");

    if (pjack === true && djack === true) {
        document.getElementById("results").innerText = "Push! Both have Blackjack!";
    }
    else if (pjack === true) {
        document.getElementById("results").innerText = "Player wins with Blackjack!";
    } 
    else if (djack === true) {
        document.getElementById("results").innerText = "Dealer wins with Blackjack!";
    } 
    
    document.getElementById("dealer-cards").innerHTML = ""; // Clear dealer cards
    console.log("Dealer card cleared");

   
        
    document.getElementById("action-buttons").style.display = "none";
    document.getElementById("deal").style.display = "inline"; // Hide deal button


}   