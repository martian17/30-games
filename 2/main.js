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


var width = 300;
var height = 500;

var canvas = BODY.add("canvas").e;
canvas.width = width;
canvas.height = height;
var ctx = canvas.getContext("2d");

var ball = {
    x:50,
    y:50,
    vx:0,
    vy:0,
    r:5,
};

var pad = {
    x:5,
    y:height-50,
    angle:0,
};

game.on("frame",({dt,t})=>{
    dx = dt/1000;
    ball.vy += 0.001*dt;
    ball.x += ball.vx*dt;
    ball.y += ball.vy*dt;
    if(ball.y > pad.y-ball.r && ball.x >= 0 && ball.x <= width){
        ball.y = pad.y-ball.r;
        //change the direction
        var angle = pad.angle;
        var magn = Math.hypot(ball.vx,ball.vy);
        console.log(magn,angle);
        ball.vx = magn*Math.sin(angle);
        ball.vy = -magn*Math.cos(angle);
    }
    if(ball.y >= height){
        alert("game over");
    }
    ctx.clearRect(0,0,width,height);
    ctx.beginPath();
    ctx.arc(ball.x,ball.y,ball.r,0,6.28);
    ctx.closePath();
    ctx.stroke();
    ctx.moveTo(0,pad.y-width/2*Math.sin(pad.angle));
    ctx.lineTo(width,pad.y+width/2*Math.sin(pad.angle));
    ctx.stroke();
});

canvas.addEventListener("mousemove",(e)=>{
    var x = e.clientX-canvas.offsetLeft;
    pad.x = x;
    pad.angle = -(width/2-pad.x)/(width/2)/3;
});

