var game = (new (function(){
    var events = {};
    var that = this;
    this.provoke = function(name,e){
        if(name in events){
            var cs = events[name];
            for(var i = 0; i < cs.length; i++){
                //executing event
                cs[i](e);
            }
        }
    }
    this.on = function(name,func){
        if(!(name in events)){
            events[name] = [];
        }
        events[name].push(func);
    }
    var start = 0;
    var animate = function(t){
        if(start === 0) start = t;
        var dt = t - start;
        start = t;
        that.provoke("frame",{dt,t});
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
})());


var canvas = BODY.add("canvas").e;
var width = 500;
var height = 500;
canvas.width = width;
canvas.height = height;
var ctx = canvas.getContext("2d");



//make the snake game

var w = 10;
var h = 10;
var grid = [];
for(var x = 0; x < w; x++){
    for(var y = 0; y < h; y++){
        grid[x+y*w] = {
            tail:false,
            head:false,
            next:null,
            idx:x+y*w,
            x:x,
            y:y,
            food:false,
            next:null,
            prev:null
        };
    }
}


var headIdx;
var lastIdx;
var init = function(){
    var x = Math.floor(w/2);
    var y = Math.floor(h/2);
    var idx = x+y*h;
    var cell = grid[idx];
    cell.head = true;
    headIdx = idx;
    lastIdx = idx;
}
init();

var food;
var dropNewFood = function(){
    while(true){
        var x = Math.floor(w*Math.random());
        var y = Math.floor(h*Math.random());
        var idx = x+y*h;
        var cell = grid[idx];
        if(!cell.head){
            cell.food = true;
            break;
        }
    }
};
dropNewFood();

var direction = 0;
/*
 0
2 3
 1
*/
document.addEventListener("keydown", function(e) {
    if(e.keyCode === 87){//w up
        direction = -w;
    }else if(e.keyCode === 83){//s down
        direction = w;
    }else if(e.keyCode === 65){//a left
        direction = -1;
    }else if(e.keyCode === 68){//d right
        direction = 1;
    }
});

var render = function(){
    ctx.clearRect(0,0,width,height);
    var ww = width/w;
    var hh = height/h;
    var www = ww*0.9;
    var hhh = hh*0.9;
    var wwm = (ww-www)/2;
    var hhm = (hh-hhh)/2;
    for(var x = 0; x < w; x++){
        for(var y = 0; y < h; y++){
            var idx = x+y*w;
            var cell = grid[idx];
            if(cell.head){
                ctx.fillStyle = "#0f0";
            }else if(cell.tail){
                ctx.fillStyle = "#000";
            }else if(cell.food){
                ctx.fillStyle = "#f00";
            }else{
                ctx.fillStyle = "#aaa";
            }
            ctx.fillRect(x*ww+wwm,y*ww+hhm,www,hhh);
        }
    }
};

setInterval(()=>{
    var idx0 = headIdx;
    var idx1 = idx0 + direction;
    var cell0 = grid[idx0];
    var cell1 = grid[idx1];
    headIdx = idx1;
    if(!cell1){//hit the wall
        alert("game over");
    }else if(cell1.food){//if food
        cell1.food = false;
        cell1.head = true;
        cell1.prev = idx0;
        cell0.next = idx1;
        dropNewFood();
        //do nothing to the last cell
    }else if(cell1.tail){
        alert("game over");
    }else{
        var lastCell = grid[lastIdx];
        lastCell.head = false;
        lastCell.tail = false;
        cell1.head = true;
        cell1.prev = idx0;
        cell0.next = idx1;
        lastIdx = lastCell.next;
    }
    render();
},300);

/*
game.on("frame",({dt,t})=>{

});
*/