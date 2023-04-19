var randomid = function(){
    return Math.random().toString(36).slice(2);
};
var Cards = function(){
    var Card = function(){
        this.id = randomid();
        this.zIndex = 0;
        this.x = 0;
        this.y = 0;
    }

    var Money = function(val){
        var card = new Card();
        card.val = val;
        card.type = "money";
        return card;
    };
    var Property = function(val,colors,complete){
        colors = colors.map(a=>a.name);
        var card = new Card();
        card.val = val;
        card.type = "property";
        card.colors = colors;
        card.color = false;
        if(colors.length === 1){
            card.color = colors[0];
        }
        card.complete = complete;//complete with this number
        return card;
    };
    var Action = function(val,description){
        card.type = "action";
        card.description = description;
    };

    var C = {
        red:{
            name:"red",
            set:3,
            color:"#f00"
        },
        green:{
            name:"green",
            set:3,
            color:"#0f0"
        },
        yellow:{
            name:"yellow",
            set:3,
            color:"#ff0"
        },
        ice:{
            name:"ice",
            set:3,
            color:"#9ff"
        },
        orange:{
            name:"orange",
            set:3,
            color:"#f80"
        },
        pink:{
            name:"pink",
            set:3,
            color:"#f8f"
        },
        brown:{
            name:"brown",
            set:2,
            color:"#800"
        },
        blue:{
            name:"blue",
            set:2,
            color:"#00f"
        },
        leaf:{
            name:"leaf",
            set:2,
            color:"#afa"
        },
        black:{
            name:"black",
            set:4,
            color:"#000"
        }
    };


    var stack = [
        Money(1),
        Money(1),
        Money(1),
        Money(1),
        Money(1),
        Money(1),
        Money(2),
        Money(2),
        Money(2),
        Money(2),
        Money(2),
        Money(3),
        Money(3),
        Money(3),
        Money(4),
        Money(4),
        Money(4),
        Money(5),
        Money(5),
        Money(10),
        Property(2,[C.pink]),
        Property(2,[C.pink]),
        Property(2,[C.pink]),
        Property(2,[C.orange]),
        Property(2,[C.orange]),
        Property(2,[C.orange]),
        Property(3,[C.yellow]),
        Property(3,[C.yellow]),
        Property(3,[C.yellow]),
        Property(1,[C.ice]),
        Property(1,[C.ice]),
        Property(1,[C.ice]),
        Property(4,[C.green]),
        Property(4,[C.green]),
        Property(4,[C.green]),
        Property(3,[C.red]),
        Property(3,[C.red]),
        Property(3,[C.red]),
        Property(2,[C.black]),
        Property(2,[C.black]),
        Property(2,[C.black]),
        Property(2,[C.black]),
        Property(4,[C.blue]),
        Property(4,[C.blue]),
        Property(1,[C.brown]),
        Property(1,[C.brown]),
        Property(2,[C.leaf]),
        Property(2,[C.leaf]),
        Action(4,"say no"),
        Action(4,"say no"),
        Action(4,"say no"),
        Action(4,"hotel"),
        Action(4,"hotel"),
        Action(3,"rent (wildcard)"),
        Action(3,"rent (wildcard)"),
        Action(3,"rent (wildcard)"),
        Action(1,"pass go"),
        Action(1,"pass go"),
        Action(1,"pass go"),
        Action(1,"pass go"),
        Action(1,"pass go"),
        Action(1,"pass go"),
        Action(1,"pass go"),
        Action(1,"pass go"),
        Action(1,"pass go"),
        Action(1,"pass go"),
        Action(5,"deal breaker"),
        Action(5,"deal breaker"),
        Action(3,"house"),
        Action(3,"house"),
        Action(3,"house"),
        Action(3,"debt collector"),
        Action(3,"debt collector"),
        Action(3,"debt collector"),
        Action(3,"forced deal"),
        Action(3,"forced deal"),
        Action(3,"forced deal"),
        Action(1,"rent red or yellow"),
        Action(1,"rent red or yellow"),
        Action(1,"rent pink or orange"),
        Action(1,"rent pink or orange"),
        Action(1,"rent black or leaf"),
        Action(1,"rent black or leaf"),
        Action(1,"rent green or blue"),
        Action(1,"rent green or blue"),
        Action(1,"rent brown or ice"),
        Action(1,"rent brown or ice"),
        Action(3,"sly deal"),
        Action(3,"sly deal"),
        Action(3,"sly deal"),
        Action(3,"sly deal"),
        Property(1,[C.ice,C.brown]),
        Property(4,[C.black,C.green]),
        Property(4,[C.black,C.ice]),
        Property(2,[C.leaf,C.black]),
        Property(4,[C.green,C.blue]),
        Property(2,[C.orange,C.pink]),
        Property(2,[C.orange,C.pink]),
        Property(3,[C.red,C.yellow]),
        Property(3,[C.red,C.yellow]),
        Action(1,"double the rent"),
        Property(0,[C.red,C.green,C.yellow,C.ice,C.orange,C.pink,C.brown,C.blue,C.leaf,C.black]),
        Action(2,"It's my birthday"),
        Action(2,"It's my birthday"),
        Action(2,"It's my birthday")
    ];

    this.stack = stack;
    this.colors = C;
};




var Room = function({pin,passwd}){
    this.pin = pin;
    this.passwd = passwd;
    var users = {};
    this.addUser = function(user,pass){
        if(this.passwd && pass !== this.passwd){
            console.log("passcode incorrect");
            return false;
        }
        if(user.room){
            user.room.removeUser(user);
        }
        user.room = this;
        users[user.id] = user;
    };
    this.removeUser = function(user){
        delete users[user.id];
    };

    var gameStarted = false;
    var players = {};
    var playerList = [];
    var cards = {};
    var colors = {};
    var stack = [];
    var pile = [];


    this.initGame = function(){
        gameStarted = true;
        players = {...users};//no new players
        playerList = Object.values(players).map(a=>a.id);
        //shuffle
        playerList.sort(()=>{return Math.random()-0.5);

        cards = {};
        stack = [];
        {stack0,colors} = new Cards();
        for(var i = 0; i < stack0.length; i++){
            var card = stack0[i];
            cards[card.id] = card;
            stack[i] = card.id;
        }
        //shuffle
        stack = stack.sort(()=>{return Math.random()-0.5});
        pile = [];
        //distribute cards to all the players
        for(var id in players){
            var user = players[id];
            user.hand = {};
            user.deck = {};
            for(var i = 0; < 5; i++){
                var card = stack.pop();
                hand[card.id] = card;
            }
        }
        this.sendFullUpdate();
    };

    this.sendFullUpdate = function(){
        var update = {};
        update.type = "update";
        update.cards = cards;//object
        update.colors = colors;//object
        update.stack = stack.length;//int
        update.pile = pile;//reference
        update.playerList = playerList;//reference
        update.players = {};//object
        for(var id in players){
            var player = players[id];
            var p = {};
            update.players[id] = p;
            p.deck = player.deck;
            p.hand = player.hand.length;//only the minimum information
        }
        var playersSecret = {};
        update.playersSecret = {};
        for(var id in players){
            var player = players[id];
            var p = {};
            playersSecret[id] = p;
            p.deck = player.deck;
            p.hand = player.hand;//only the minimum information
        }
        update = JSON.stringify(update);
        for(var key in players){
            var player = players[key];
            player.ws.send(update);
        }
    };
    //position
    this.moveCard = function(){

    };
    this.drawCard = function(){

    };
    this.showCard = function(){

    };
    this.giveCard = function(){

    };




    this.distributeCards = function(){
        for(var i = 0; i < users.length; i++){

        }
    }

    this.startGame = function(){
        //distribute the cards
    }
    this.getUserCards = function(){

    }
}



var PINs = function(n){
    if(n > 900)n = 900;
    var available = {};
    var list = [];
    for(var i = 0; i < n; i++){
        while(true){
            var pin =
            Math.floor(Math.random()*10)+
            Math.floor(Math.random()*10)+
            Math.floor(Math.random()*10)+
            Math.floor(Math.random()*10);
            if(!(pin in available)){
                available[pin] = true;
                list.push(pin);
                break;
            }
        }
    }
    this.get = function(){
        if(list.length === 0){
            return false;
        }
        return list.pop();
    };
    this.release = function(pin){
        list.push(pin);
    };
};


var rooms = function(users){//constructor
    var pinmanager = new PINs(100);
    this.pins = {};
    this.add = function({passwd}){
        var pin = pinmanager.get();
        if(!pin)throw new Error("pin overflow");
        var room = new Room({//yeah implement encryption here
            pin,passwd:passwd
        });
        this.pins[pin] = room;
    }
    this.remove = function(pin){
        var room = this.pins[pin];
        room.remove();
        delete this.pins[pin];
        pinmanager.release(pin);
    }
}


module.export = function(users){
    return new rooms(users);
}