BODY.add("style",0,`
body{
    margin:0px;
}
.col{
    width:50%;
    height:100vh;
    float:left;
    display:grid;
    place-items:center;
}

.cw{
    
}


.cup-w{
    height:60vh;
    width:30vh;
    position:relative;
    /*transform-origin: bottom;*/
}

.cup{
    box-sizing:border-box;
    width:30vh;
    border-top:60vh solid #9bdaff;
    border-left:5vh solid #00000000;
    border-right:5vh solid #00000000;
}

.cup-rim{
    position:absolute;
    top:0px;
    height:100%;
    overflow:hidden;
}

.cup-rim-i{
    box-sizing:border-box;
    width:30vh;
    margin-top:0vh;
    border-top:60vh solid #ccc;
    border-left:5vh solid #00000000;
    border-right:5vh solid #00000000;
}


@media all and (max-width: 100vh){
    .cup-w{
        height:60vw;
        width:30vw;
    }

    .cup{
        width:30vw;
        border-top:60vw solid #9bdaff;
        border-left:5vw solid #00000000;
        border-right:5vw solid #00000000;
    }

    .cup-rim-i{
        width:30vw;
        margin-top:0vw;
        border-top:60vw solid #ccc;
        border-left:5vw solid #00000000;
        border-right:5vw solid #00000000;
    }
}

.button{
    font-size:20px;
    background-color:#4d65e6;
    color:#fff;
    text-align:center;
    margin:5px;
    border-radius:5px;
}

.L{
    font-size:20px;
    text-align:center;
}

h1{
    margin:0;
}
`);



BODY.add("h1",0,"Measure 6L using 9L and 4L cups");

var Cup = function(size){
    var cup = new ELEM("div","class:cup-w");
    this.e = cup.e;
    this.elem = cup;
    cup.e.style.transform = "scale("+Math.sqrt(size)+")";
    cup.add("div","class:cup");
    var rim = cup.add("div","class:cup-rim")
    rim.add("div","class:cup-rim-i");
    this.fill = function(r){
        rim.e.style.height = (100-r*100)+"%";
    }
};


var left = BODY.add("div","class:col");
var right = BODY.add("div","class:col");

var l1max = 9;
var l1 = 0;
var cup1 = new Cup(1*0.81);
var cw1 = left.add("div","class:cw");
var ld1 = cw1.add("div","class:L","0L/9L");
cw1.add(cup1.e);
cw1.add("div","class:button","fill").e.addEventListener("click",function(){
    l1 = l1max;
    reflect();
});
cw1.add("div","class:button","drain").e.addEventListener("click",function(){
    l1 = 0;
    reflect();
});
cw1.add("div","class:button","transfer").e.addEventListener("click",function(){
    l2 += l1;
    l1 = 0;
    if(l2 > l2max){
        l1 = l2 - l2max;
        l2 = l2max;
    }
    reflect();
});

var l2max = 4;
var l2 = 0;
var cup2 = new Cup(4/9*0.81);
var cw2 = right.add("div","class:cw");
var l2 = 0;
var ld2 = cw2.add("div","class:L","0L/4L");
cw2.add(cup2.e);
cw2.add("div","class:button","fill").e.addEventListener("click",function(){
    l2 = l2max;
    reflect();
});
cw2.add("div","class:button","drain").e.addEventListener("click",function(){
    l2 = 0;
    reflect();
});
cw2.add("div","class:button","transfer").e.addEventListener("click",function(){
    l1 += l2;
    l2 = 0;
    if(l1 > l1max){
        l2 = l1 - l1max;
        l1 = l1max;
    }
    reflect();
});

var reflect = function(){
    cup1.fill(l1/l1max);
    ld1.e.innerHTML = l1+"L/"+l1max+"L";
    cup2.fill(l2/l2max);
    ld2.e.innerHTML = l2+"L/"+l2max+"L";
    if(l1 === 6){
        setTimeout(()=>alert("game clear"),100);
    }
}



