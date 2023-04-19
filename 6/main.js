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
var width = 1000;
var height = 500;
canvas.width = width;
canvas.height = height;
var ctx = canvas.getContext("2d");

var randomid = function(){
    return Math.random().toString(36).slice(2);
};


var v = 300;

var boxes = {};

var createBox = function(){
    var h = 60;
    var w = 30;
    var id = randomid();
    boxes[id] = {
        x:1000,
        y:height-h,
        w,h
    };
    setTimeout(createBox,900+Math.random()*900);
};

createBox();

var collision = function(obj1,obj2){
    var x0a = obj1.x;
    var y0a = obj1.y;
    var x1a = obj1.x+obj1.w;
    var y1a = obj1.y+obj1.h;
    var x0b = obj2.x;
    var y0b = obj2.y;
    var x1b = obj2.x+obj2.w;
    var y1b = obj2.y+obj2.h;
    if(x0a < x1b && x1a > x0b && y0a < y1b && y1a > y0b){
        return true;
    }else{
        return false;
    }
}


var me = {
    x:20,
    y:height-40,
    w:20,
    h:40,
    vy:0
};

game.on("frame",({dt,t})=>{
    ctx.clearRect(0,0,width,height);
    for(var id in boxes){
        var box = boxes[id];
        box.x -= v*dt/1000;
        if(box.x < -100){
            delete box[id];
        }
        ctx.strokeRect(box.x,box.y,box.w,box.h);
        if(collision(me,box)){
            alert("Game Over. Score: "+t);
        }
    }
    me.vy += 3000*dt/1000;
    me.y += me.vy*dt/1000;
    if(me.y+me.h >= height){
        me.y = height-me.h;
        //jumpable
        console.log("asdfasdf");
        if(controls.jump)me.vy = -1000;
    }
    ctx.strokeRect(me.x,me.y,me.w,me.h);
    ctx.fillText(""+t,width-200,100);
});

var controls = {
    jump:false
};

document.addEventListener("keydown", function(e) {
    if(e.keyCode === 32){//w up
        controls.jump = true;
    }
});

document.addEventListener("keyup", function(e) {
    if(e.keyCode === 32){//w up
        controls.jump = false;
    }
});




