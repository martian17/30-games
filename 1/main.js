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


var blocks = (function(){
    var blocks = [];
    var w = 7;
    var h = 3;
    for(var i = 0; i < w; i++){
        for(var j = 0; j < h; j++){
            blocks.push({
                x:i*(width/w)+5,
                y:j*(width/w)/2+5,
                w:(width/w)-10,
                h:(width/w)/2-10,
                display:true
            });
        }
    }
    return blocks;
})();

var ball = {
    x:200,
    y:150,
    vx:200,//px/s
    vy:200,
    r:5,
    collide:function(box){
        if( this.x > box.x-this.r && this.x < box.x+box.w+this.r &&
            this.y > box.y-this.r && this.y < box.y+box.h+this.r){
            if( this.x > box.x && this.x < box.x+box.w&&
                this.y > box.y-this.r && this.y < box.y){
                return {
                    type:"t"
                };
            }else if(
                this.x > box.x && this.x < box.x+box.w&&
                this.y > box.y+box.h && this.y < box.y+box.h+this.r){
                return {
                    type:"b"
                };
            }else if(
                this.x > box.x-this.r && this.x < box.x&&
                this.y > box.y && this.y < box.y+box.h){
                return {
                    type:"l"
                };
            }else if(
                this.x > box.x+box.w && this.x < box.x+box.w+this.r&&
                this.y > box.y && this.y < box.y+box.h){
                return {
                    type:"r"
                };
            }else if(
                this.x > box.x && this.x < box.x+box.w&&
                this.y > box.y && this.y < box.y+box.h){
                return {
                    type:"c"
                };
            }else if(Math.hypot(box.x-this.x,box.y-this.y) < this.r){
                return {
                    type:"tl",
                    origin:[box.x,box.y]
                };
            }else if(Math.hypot(box.x+box.w-this.x,box.y-this.y) < this.r){
                return {
                    type:"tr",
                    origin:[box.x+box.w,box.y]
                };
            }else if(Math.hypot(box.x-this.x,box.y+box.h-this.y) < this.r){
                return {
                    type:"bl",
                    origin:[box.x,box.y+box.h]
                };
            }else if(Math.hypot(box.x+box.w-this.x,box.y+box.h-this.y) < this.r){
                return {
                    type:"br",
                    origin:[box.x+box.w,box.y+box.h]
                };
            }
        }
        return false;
    },
    resolveCollision:function(originx,originy){
        var origin = colpad.origin;
        //calc the mirror
        var ax = ball.x-origin[0];
        var ay = ball.y-origin[1];
        var bx = -ball.vx;
        var by = -ball.vy;
        //common intermediate variable
        var dotm2 = (ax*bx+ay*by)/(ax*ax+ay*ay);
        ball.vx = -bx+2*ax*dotm2;
        ball.vy = -by+2*ay*dotm2;

        var alen = Math.hypot(ax,ay);
        ball.x = origin[0]+ax/alen*ball.r;
        ball.y = origin[1]+ay/alen*ball.r;
    }
};

var pad = {
    x:100,
    y:height-50,
    w:100,
    h:30
};



var controlDirection = 0;


var paused =false;
game.on("frame",function(e){
    if(paused)return false;
    //rendering
    ctx.clearRect(0,0,width,height);
    for(var i = 0; i < blocks.length; i++){
        var b = blocks[i];
        if(b.display === false)continue;
        ctx.fillStyle = "#940052";
        ctx.fillRect(b.x,b.y,b.w,b.h);
    }
    //ball
    ctx.beginPath();
    ctx.arc(ball.x,ball.y,ball.r,0,6.28);
    ctx.closePath();
    ctx.fillStyle = "#000";
    ctx.fill();
    //pad
    ctx.fillStyle = "#800";
    ctx.fillRect(pad.x,pad.y,pad.w,pad.h);

    //motion
    ball.x += e.dt/1000*ball.vx;
    ball.y += e.dt/1000*ball.vy;
    //pad motion
    pad.x += controlDirection*e.dt/1000*200;
    if(pad.x < 0){
        pad.x = 0;
    }else if(pad.x > width-pad.w){
        pad.x = width-pad.w;
    }

    //collision and velocity position correction
    if(ball.y > height){
        alert("game over");
        paused = true;
    }else if(ball.y < 0+ball.r){
        ball.vy = -ball.vy;
        ball.y = 0+ball.r;
    }else if(ball.x < 0+ball.r){
        ball.vx = -ball.vx;
        ball.x = 0+ball.r;
    }else if(ball.x > width-ball.r){
        ball.vx = -ball.vx;
        ball.x = width-ball.r;
    }else{
        //collision detection
        var colpad = ball.collide(pad);
        if(colpad){
            var type = colpad.type;
            if(type === "t" || type === "c"){
                ball.vy = -Math.abs(ball.vy);
                ball.y = pad.y-ball.r;
            }else if(type === "b"){
                ball.vy = Math.abs(ball.vy);
                ball.y = pad.y+pad.h+ball.r;
            }else if(type === "l"){
                ball.vx = -Math.abs(ball.vx);
                ball.x = pad.x-ball.r;
            }else if(type === "r"){
                ball.vx = Math.abs(ball.vx);
                ball.x = pad.x+pad.w+ball.r;
            }else{//tl tr bl br
                var origin = colpad.origin;
                //calc the mirror
                var ax = ball.x-origin[0];
                var ay = ball.y-origin[1];
                var bx = -ball.vx;
                var by = -ball.vy;
                //common intermediate variable
                var dotm2 = (ax*bx+ay*by)/(ax*ax+ay*ay);
                ball.vx = -bx+2*ax*dotm2;
                ball.vy = -by+2*ay*dotm2;

                var alen = Math.hypot(ax,ay);
                ball.x = origin[0]+ax/alen*ball.r;
                ball.y = origin[1]+ay/alen*ball.r;
            }
        }else{//see the block collision
            for(var i = 0; i < blocks.length; i++){
                var b = blocks[i];
                if(b.display === false)continue;
                var colblock = ball.collide(b);
                if(colblock){
                    b.display = false;
                    var type = colblock.type;
                    if(type === "t" || type === "c"){
                        ball.vy = -Math.abs(ball.vy);
                        ball.y = b.y-ball.r;
                    }else if(type === "b"){
                        ball.vy = Math.abs(ball.vy);
                        ball.y = b.y+b.h+ball.r;
                    }else if(type === "l"){
                        ball.vx = -Math.abs(ball.vx);
                        ball.x = b.x-ball.r;
                    }else if(type === "r"){
                        ball.vx = Math.abs(ball.vx);
                        ball.x = b.x+b.w+ball.r;
                    }else{//tl tr bl br
                        var origin = colblock.origin;
                        //calc the mirror
                        var ax = ball.x-origin[0];
                        var ay = ball.y-origin[1];
                        var bx = -ball.vx;
                        var by = -ball.vy;
                        //common intermediate variable
                        var dotm2 = (ax*bx+ay*by)/(ax*ax+ay*ay);
                        ball.vx = -bx+2*ax*dotm2;
                        ball.vy = -by+2*ay*dotm2;

                        var alen = Math.hypot(ax,ay);
                        ball.x = origin[0]+ax/alen*ball.r;
                        ball.y = origin[1]+ay/alen*ball.r;
                    }
                    break;
                }
            }
        }
    }
});



var left = 0;
var right = 0;
//keydown
document.addEventListener("keydown", function(e) {
    if(e.keyCode === 37 || e.keyCode === 65){
        left = -1;
        controlDirection = left + right;
    }else if(e.keyCode === 39 || e.keyCode === 68){
        right = 1;
        controlDirection = left + right;
    }
});
//keyup
document.addEventListener("keyup", function(e) {
    if(e.keyCode === 37 || e.keyCode === 65){
        left = 0;
        controlDirection = left + right;
    }else if(e.keyCode === 39 || e.keyCode === 68){
        right = 0;
        controlDirection = left + right;
    }
});


//maybe use later but not now
/*
var keystack = (new (function(){
    var s = {};
    this.s = s;
    var headn = 1;
    this.push = function(n){
        s[n] = headn;
        headn++;
    }
    this.pop = function(n){
        s[n] = 0;
    }
    this.peek = function(){
        var maxone = false;
        var maxn = 0;
        for(var n in s){
            if(s[n] > maxn){
                maxone = n;
                maxn = s[n];
            }
        }
        return maxone;
    }
})());

//keydown
document.addEventListener("keydown", function(e) {
    if(e.keyCode === 37 || e.keyCode === 65){
        controlDirection = -1;
        keystack.push(e.keyCode);
    }else if(e.keyCode === 39 || e.keyCode === 68){
        controlDirection = 1;
        keystack.push(e.keyCode);
    }
});
//keyup
document.addEventListener("keyup", function(e) {
    if( e.keyCode === 37 || e.keyCode === 65 ||
        e.keyCode === 39 || e.keyCode === 68){
        keystack.pop(e.keyCode);

        var peeked = keystack.peek();
        if(peeked === false){
            controlDirection = 0;
        }else if(peeked === 37 || peeked === 65){
            controlDirection = -1;
        }else{ // if(peeked === 39 || peeked === 68)
            controlDirection = 1;
        }
    }
});*/










