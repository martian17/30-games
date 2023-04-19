
var randomColorArr = [
    "#000",
    "#f00",
    "#0f0",
    "#00f",
    "#ff0",
    "#f0f",
    "#0ff",
    "#fff",
];
var randomColor = function(){
    if(randomColorArr.length > 0){
        return randomColorArr.pop();
    }else{
        return "rgb("+Math.floor(Math.random()*256)+","+Math.floor(Math.random()*256)+","+Math.floor(Math.random()*256)+")";
    }
};

var sleep = function(t){
    return new Promise((resolve,reject)=>{
        setTimeout(resolve,t);
    });
};



var modifyQuery = function(key,val){
    var queryParams = new URLSearchParams(window.location.search);
    queryParams.set(key,val);
    history.replaceState(null, null, "?"+queryParams.toString());
}

//if query
var queries = (new URL(window.location.href)).searchParams;


var waitFlipResolves = [];
var waitFlip = function(){
    return new Promise((resolve,reject)=>{
        var waiting = true;
        waitFlipResolves.push(resolve);
    });
};


var init = async function(){
    var playercnt,cardcnt;
    if(queries.get("playercnt")){
         playercnt = parseInt(queries.get("playercnt"));
    }else{
        playercnt = await setPlayerCnt();
        modifyQuery("playercnt",playercnt);
    }

    if(queries.get("cardcnt")){
        cardcnt = parseInt(queries.get("cardcnt"));
    }else{
        cardcnt = await setCardCnt();
        modifyQuery("cardcnt",cardcnt);
    }
    var scoreboard = BODY.add("div",false,"class:players");
    scoreboard.add("a","start a new game","class:new-game-button;href:file_:///home/yutaro/prog/30games/13/index.html");
    var players = [];
    for(var i = 0; i < playercnt; i++){
        var pp = scoreboard.add("div","player"+(i+1)+": 0 points","class:player");
        players[i] = [pp,0];
    }
    var cardsE = BODY.add("div",false,"class:display");
    var cards = [];
    for(var i = 0; i < cardcnt; i++){
        var color = randomColor();
        cards.push([flipCard(color),color]);
        cards.push([flipCard(color),color]);
    }
    cards.sort(a=>(Math.random()-0.5));
    for(var i = 0; i < cards.length; i++){
        var card = cards[i][0];
        cardsE.add(card);
        card.e.addEventListener("click",function(){
            waitFlipResolves.map(a=>{
                a(this)
            });
            waitFlipResolves = [];
        });
    }
    //now they are ready
    var totalFlipped = 0;
    while(true){
        for(var i = 0; i < players.length; i++){
            var player = players[i];
            player[0].e.classList.add("active");
            var card1 = await waitFlip();
            card1.flip();
            var card2 = await waitFlip();
            card2.flip();
            var flipped = false;
            if(card1.color === card2.color){
                totalFlipped++;
                player[1]++;
                player[0].e.innerHTML = "player"+(i+1)+": "+player[1]+" points";
                flipped = true;
            }
            await sleep(1000);
            if(flipped === false){
                card1.unflip();
                card2.unflip();
            }
            if(totalFlipped === cardcnt){
                break;
            }
            player[0].e.classList.remove("active");
        }
        if(totalFlipped === cardcnt){
            break;
        }
    }
    await sleep(1000);
    modal.show();
    modal.initialize();
    modal.add("a","play another game","class:another-game;href:"+window.location.href.replaceAll("_","__").replaceAll(":","_:").replaceAll(";","_;"));
};

var modal = BODY.add("div",false,"class:modal");
modal.initialize = function(){
    [...this.e.children].map((a)=>{
        this.e.removeChild(a);
    });
    return false;
};
modal.show = function(){
    this.e.style.display = "block";
};
modal.hide = function(){
    this.e.style.display = "none";
};


var setPlayerCnt = function(){
    return new Promise((resolve,reject)=>{
        modal.initialize();
        modal.show();
        modal.add("span","number of players:","class:card-span");
        modal.add("br");
        var input = modal.add("textarea",false,"class:num-input");
        modal.add("br");
        modal.add("div","next","class:button").e.addEventListener("click",function(){
            var val = parseInt(input.e.value);
            if(val > 0){
                modal.hide();
                resolve(val);
            }
        });
    });
};

var setCardCnt = function(){
    return new Promise((resolve,reject)=>{
        modal.initialize();
        modal.show();
        modal.add("span","number of cards:","class:card-span");
        modal.add("br");
        var input = modal.add("textarea",false,"class:num-input");
        modal.add("span","x2","class:card-span");
        modal.add("br");
        modal.add("div","next","class:button").e.addEventListener("click",function(){
            var val = parseInt(input.e.value);
            if(val > 0){
                modal.hide();
                resolve(val);
            }
        });
    });
};

BODY.add("style",`
.modal{
    width:100vw;
    height:100vh;
    position:fixed;
    top:0px;
    left:0px;
    background-color:#0008;
    text-align:center;
    display:none;
    z-index:10;
    padding-top:20vh;
}
.num-input{
    width:150px;
    height:50px;
    display:inline-block;
    font-size:30px;
    text-align:center;
}
.card-span{
    font-size:30px;
    display:inline-block;
    padding:10px 20px;
}
.button{
    font-size:30px;
    display:inline-block;
    padding:10px 20px;
    background-color:#0f0;
    color:#fff;
    border-radius:10px;
}
.another-game{
    display:block;
    font-size:30px;
    display:inline-block;
    padding:10px 20px;
    background-color:#0f0;
    color:#fff;
    border-radius:10px;
}


.players{
    float:left;
    width:20%;
    position:relative;
}

.new-game-button{
    width:100%;
    padding: 10px 0px 10px 20px;
    border:solid 1px #000;
    box-sizing:border-box;
    font-size:20px;
    background-color:#0f0;
    color:#fff;
    display:block;
}

.player{
    width:100%;
    padding: 10px 0px 10px 20px;
    border:solid 1px #000;
    box-sizing:border-box;
    font-size:20px;
}

.display{
    float:left;
    width:80%;
    overflow:hidden;
}
.active{
    border:2px solid #000;
}


.card {
  background-color: transparent;
  width: 100px;
  height: 150px;
  margin:20px;
  border-radius:10px;
  overflow:hidden;
  perspective: 1000px;
  float:left;
  border:solid 1px #000;
  box-sizing:border-box;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
}

.card-flipped .card-inner {
  transform: rotateY(180deg);
}

.card-front, .card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

.card-front {
  background-color: #002;
  color: black;
}

.card-back {
  color: white;
  transform: rotateY(180deg);
}
`);

var flipCard = function(color){
    var card = new ELEM("div",false,"class:card");
    var inner = card.add("div",false,"class:card-inner");
    var front = inner.add("div",false,"class:card-front");
    var back = inner.add("div",false,"class:card-back","background-color:"+color);

    card.color = color;
    card.flip = function(){
        card.e.classList.add("card-flipped");
    };
    card.unflip = function(){
        card.e.classList.remove("card-flipped");
    };
    card.e.flip = card.flip;
    card.e.unflip = card.unflip;
    card.e.color = card.color;
    return card;
};


init();
