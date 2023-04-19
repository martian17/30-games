BODY.add("style",`

.display{
    width:100vw;
}
.www{
    width:100vw;
    text-align:center;
}
.b{
    font-size:30px;
    text-align:center;
    display:inline-block;
    background-color:#0f0;
    border-radius:5px;
    color:#fff;
    padding:5px;
}
.question{
    width:100%;
    text-align:center;
    font-size:30px;
    height:30vh;
    line-height:30vh;
}
.answer{
    width:100%;
    text-align:center;
    height:10vh;
    font-size:30px;
}

`);
var display =BODY.add("div",false,"class:display");
var que = display.add("div",false,"class:question");
var ans = display.add("textarea",false,"class:answer");
var www = BODY.add("div",false,"class:www");
var b = www.add("div","start","class:b");

var sleep = function(t){
    return new Promise((resolve,reject)=>{
        setTimeout(resolve,t);
    });
};

var startGame = async function(){
    var score = 0;
    for(var i = 0; i < 10; i++){
        var a = Math.floor(Math.random()*10);
        var b = Math.floor(Math.random()*10);
        var c = a+b;
        que.e.innerHTML = a+"+"+b;
        await sleep(2000);
        var av = ans.e.value;
        ans.e.value = "";1000
        if(av === c+""){
            score++;
        }
    }
    alert("the score is "+score);
}

b.e.addEventListener("click",()=>{
    startGame();
});