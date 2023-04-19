var board = (new (function(){
    //basic structure
    var wrapper = BODY.add("div",false,"class:board-wrapper");
    var opponents = new Opponents(wrapper);
    var stack = new Stack(wrapper);
    var me = new Me(wrapper);
    var pile = new Pile(wrapper);

    //basic data
    var cards = {};//id card data combination
    var colors = {};
    //basic data done, everything will be referred from here

    var Deck = function(parent){
        this.cards = {};
        this.add = function(card){//card is an object
            this.cards[card.id] = card;
            
        };
    };
    /*
wrapper
|-opponents
| |-[]player
|   |-field
|   |-invisible-hand
|-me-player
| |-field
| |-hand
|-stack
|-pile
    */

    opponents.draw();//just the number
    opponents.add(player);//just add it to the cards
    me.draw(id);
    me.show(,id);

    stack.add(n);

    this.addOpponent = function(player){
        opponents.add(player);
    };
    this.
    this.drawCard = function(player,card){

    }

    this.removeOpponent = function(){

    };

    this.moveCardsPlayers = function(){

    };
    this.moveCard

    var opponentsE = wrapper.add("div",false,"class:opponents");

    //stack, me, and pile
    var stackE = wrapper.add("div",false,"class:stack");
    var meE = wrapper.add("div",false,"class:me");
    var pileE = wrapper.add("div",false,"class:pile");

    //setting up the stack

})());

/*
var update = {};
update.type = "update";
update.cards = cards;//object
update.colors = colors;//object
update.stack = stack.length;//int
update.pile = pile;//reference
update.playerList = playerList;//reference
update.players = {};//object
*/







var board = (new (function(){
    var wrapper = BODY.add("div",false,"class:board-wrapper");
    var opponentsE = wrapper.add("div",false,"class:opponents");

    //stack, me, and pile
    var stackE = wrapper.add("div",false,"class:stack");
    stackE.cards = stackE.add("div",false,"class:cards");
    stackE.draw = stackE.add("div","Draw","class:button");
    stackE.shuffle = stackE.add("div","Shuffle","class:button");
    stackE.addCards = stackE.add("div","Add Another Stack","class:button");

    var meE = wrapper.add("div",false,"class:me");
    meE.add(cardField());


    var pileE = wrapper.add("div",false,"class:pile");
    pileE.cards = pileE.add("div",false,"class:cards");
    pileE.shuffle = pileE.add("div","Shuffle","class:button");
    pileE.addToStack = pileE.add("div","Add to the Stack","class:button");

    addButton(pileE,"Add to the Stack");

    this.colors = {};
    this.cards = {};

    //different sections
    //opponents
    //stack
    //pile
    //me



    this.addColors = function(){

    }
    this.addCards = function(){

    }

})());


var createMyField = function(root){
    this.showCard = function(id,){

    }

    this.cards = [];

    this.addCard = function(id,x,y){

    }
}