const deal_btn = document.getElementById("deal");
const hit_btn = document.getElementById("hit");
const stand_btn = document.getElementById("stand");
const start_btn = document.getElementById("start");
const dealer_card = document.getElementById("dealer-cards");
const player_card = document.getElementById("your-cards");
const abutton = document.getElementById("action-buttons");
const psum = document.getElementById("player-sum");
const dsum = document.getElementById("dealer-sum");
const result = document.getElementById("result");
const bet_sec = document.getElementById("bet-sec");

const cardImg = document.createElement("img");


deal_btn.disabled = true; // Disable deal button initially

deal_btn.addEventListener("click", dealhand);
hit_btn.addEventListener("click", dealcard);
stand_btn.addEventListener("click", stand);
start_btn.addEventListener("click", start);

let deck = [];
let sdeck = [];
let ptotal = 0;
let dtotal = 0;
canHit = true;
let playerHand = [];
let dealerHand = []; // Initialize dealer's hand
let turn = "player"; // Track whose turn it is
let winner = "tie";
pAce = false;
dAce = false;
pjack = false; // Flag to track if player has a blackjack
djack = false; // Flag to track if dealer has a blackjack


function initalstate() {
    console.log("initalstate called");
    let deck = [];
    let sdeck = [];
    let ptotal = 0;
    let dtotal = 0;
    canHit = true;
    let playerHand = [];
    let dealerHand = []; // Initialize dealer's hand
    let turn = "player"; // Track whose turn it is
    let winner = "tie";
    pAce = false;
    dAce = false;
    pjack = false; // Flag to track if player has a blackjack
    djack = false; // Flag to track if dealer has a blackjack

}

function start(){
    console.log("start called");
    initalstate();

    buildDeck();
    deal_btn.disabled = false;
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

    console.log(deck);
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
    bet_sec.style.display = "none";

    stand_btn.disabled = false; // Enable stand button
    hit_btn.disabled = false; // Enable hit button
    document.getElementById("start-card").style.display = "none"; // Hide start card


    //TEMP DECK TO CHECK EDGE CASES
    // deck = [ "A-C","K-D", "K-C", "A-D","A-C", "8-D", "K-C", "K-D","A-C", "A-D", "K-C", "K-D" ]
    // deck = [ "A-C", "A-D", "A-S", "A-H","A-C","A-D", "A-S", "A-H","A-C","A-D", "A-S", "A-H","A-C" ]
    // deck = [ "A-C","2-D", "2-C", "2-D","2-C", "2-D", "2-C", "2-D","A-C", "A-D", "K-C", "K-D" ]

    turn = "dealing"; // Set turn to dealing
    
    for (let i = 0; i < 2; i++) {
        playerHand.push(deck[0]);
        deck.shift(); // Remove the first card from the deck
        dealerHand.push(deck[0]);
        deck.shift(); // Remove the first card from the deck
    }
    showcards(); // Show player's cards
    checkBJ();
    total(); // Calculate totals for player and dealer
    turn = "player"; // Set turn to player after dealing cards
    abutton.style.display = "inline"; // Show action buttons
    console.log("Player Hand: " + playerHand);
    console.log("Dealer Hand: " + dealerHand);
    console.log("Deck after dealing: " + deck);

}

function cardValue(card) {
    console.log("cardValue called: "+ card );
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

function dealcard(){
    console.log("card dealt to: " + turn)
    if (turn === "player") {
        playerHand.push(deck[0]);
        showcards();
        total(); // Update player's total after dealing a new card
        console.log(turn +" Hand: " + playerHand);
        deck.shift(); // Remove the first card from the deck
    }
    else if (turn === "dealer") {
        dealerHand.push(deck[0]);
        total(); // Update dealer's total after dealing a new card
        console.log("Dealer Hand: " + dealerHand);
        deck.shift(); // Remove the first card from the deck
    }
    console.log("Deck after dealing: " + deck);
    
}

function stand() {
    console.log("stand called");
    hit_btn.disabled = true; // Disable hit button
    stand_btn.disabled = true; // Disable stand button    
    dealerTurn();
}

function dealerTurn() {
    console.log("dealerTurn called");
    turn = "dealer"; // Switch to dealer's turn
    if (ptotal > 21){
        dsum.innerHTML = dealerHand[0]+ dealerHand[1];
        return;
    }
    else if (dtotal < 18){
        dealcard();
        
    }

}

function checkBJ() {
    console.log("checkBJ called");
    
    // Check for Blackjack for player
    if ((cardValue(playerHand[0]) === 1 && cardValue(playerHand[1]) === 10) || (cardValue(playerHand[1]) === 1 && cardValue(playerHand[0]) === 10)){
        pjack = true;
        console.log("Player has a Blackjack!");
        if(pjack){
            if ((cardValue(dealerHand[0]) === 1 && cardValue(dealerHand[1]) === 10) || (cardValue(dealerHand[1]) === 1 && cardValue(dealerHand[0]) === 10)){
                djack = true;
                console.log("Dealer has a Blackjack!");
            }
        }
    }

    if(cardValue(dealerHand[0]) === 1 && cardValue(dealerHand[1]) === 10) {
        djack = true;
        console.log("Dealer has a Blackjack!");
        
    }

    if(pjack || djack) {
        console.log("Blackjack detected");
        handend();
    }
    
}

function showcards(){
    console.log("showcards called");

    if (turn === "dealing") {
        for (let i = 0; i < playerHand.length; i++) {
            
            let cardImg = document.createElement("img");
            let card = playerHand[i]; // Get the last card dealt to the player
            cardImg.src = "./cards/" + card + ".png";
            player_card.append(cardImg);
            console.log("showing player card: "+ card);
        }

        //HOLE CARD FOR DEALER
        dealer_card.innerHTML = '<img id="hole" src="./cards/BACK.png">'; 
        dealer_card.append(cardImg);
        console.log("Show dealer's hole card && dealing true");
        //DEALER FIRST CARD
        card = dealerHand[0]; // Show only the first card of the dealer
        cardImg.src = "./cards/" + card + ".png";
        dealer_card.append(cardImg);
        console.log("Show dealer's first card: "+ card);
    }


    if (turn === "player") {
        let cardImg = document.createElement("img");
        let card = playerHand[playerHand.length -1]; // Get the last card dealt to the player
        cardImg.src = "./cards/" + card + ".png";
        player_card.append(cardImg);
        console.log("Show card to player && dealing true: ");
    }
    
}

function total(){
    console.log("total called for: " + turn);

    if (turn === "dealing") {
       ptotal = cardValue(playerHand[0]) + cardValue(playerHand[1]);

       if (cardValue(playerHand[0]) === 1 || cardValue(playerHand[1]) === 1){
            pAce = true;
            psum.innerHTML = ptotal +"/"+(ptotal + 10)
       }
       else{
            psum.innerHTML = ptotal; // Display player's total
       }
        
       dtotal = cardValue(dealerHand[0]);

       if (cardValue(dealerHand[0]) ===1){
            dsum.innerHTML = dtotal + "/" + (dtotal+10);
       }
       else{
            dsum.innerHTML = dtotal; // Display dealer's  face up total
       }
       dtotal += cardValue(dealerHand[1]); // Add the value of the second card dealt to the dealer

    }

    if (turn === "player") {
        ptotal += cardValue(playerHand[playerHand.length - 1]); // Add the value of the last card dealt to the player
        if (ptotal < 22){
            psum.innerHTML = ptotal; // Update player's total display
            console.log("total called for player: "+ turn);

        }
        else if(ptotal > 21){
            psum.innerHTML = ptotal + " Player Bust"; // Update player's total display
            console.log(turn + " bust");
            abutton.style.display = "none";
            dealerTurn();
        }       
    }   

    if (turn === "dealer") {
        dtotal += cardValue(dealerHand[dealerHand.length - 1]); // Add the value of the last card dealt to the dealer
        dsum.innerHTML = dtotal; // Update dealer's total display
        console.log("total called for dealer: " + turn);
    }
}

function handend() {
    if (pjack && djack) {
        console.log("Both player and dealer have Blackjack! It's a tie.");
        result.innerHTML = "Both player and dealer have Blackjack! It's a tie.";
        winner = "tie";
        payout();
    } 
    else if (pjack) {
        console.log("Player has Blackjack! Player wins!");
        result.innerHTML = "Player has Blackjack! Player wins!";  
        winner = "player";  
        payout();                
    } 
    else if (djack) {
        console.log("Dealer has Blackjack! Dealer wins!");
        result.innerHTML = "Dealer has Blackjack! Dealer wins!";
        winner = "dealer";
        payout();
    }

}

function payout() {
    console.log("payout called" + winner);
   
}