document.getElementById("deal").addEventListener("click", dealhand);
document.getElementById("hit").addEventListener("click", hit);
document.getElementById("stand").addEventListener("click", stand);
document.getElementById("start").addEventListener("click", start);
document.getElementById("deal").disabled = true; // Disable deal button initially
document.getElementById("reset").disabled = true; // Disable reset button initially



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

function start(){

    console.log("Starting...");
    document.getElementById("deal").style.display = "none";
    buildDeck();
    dealhand();
    document.getElementById("start").disabled = true; // Disable start button after starting the game
    document.getElementById("deal").disabled = false; // Enable deal button initially
    // document.getElementById("reset").disabled = false; // Enable reset button initially

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
        console.log("Player Ace: " + pAce);
        if (pAce === true){
            checkBJ(); // Check if player has a blackjack
            document.getElementById("your-sum").innerText = ptotal + "/" + (ptotal + 10); // Show both values of Ace
        }
        else{
            document.getElementById("your-sum").innerText = ptotal;
        }
        console.log("Deal hand to player: " + ptotal);
        console.log("Player Hand: ", playerHand);
        deck.shift(); // Remove the dealt cards from the deck


        turn = "dealer"; // Set turn to dealer
        dealerHand.push(deck[0]);
        dtotal += getValue(deck[0]); // Get the value of the card
        console.log("Dealer Ace: " + dAce);
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