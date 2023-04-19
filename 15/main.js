var hypot2 = function(a,b){
    return a*a+b*b;
};


//lines
var lines = [];

var addLine = function(x,y,w,h){
    var line = {
        x,y,w,h,vx:0,vy:0,dadt:0
    };
    lines.push(line);
    return line;
};

var holes = [];
var addHole = function(x,y,r,score){
    var hole = {
        x,y,r,score
    };
    holes.push(hole);
    return hole;
}

var findLineIntersection = function(ball){
    var r = ball.r;
    var x = ball.x;
    var y = ball.y;
    var result = [];
    for(var i = 0; i < lines.length; i++){
        var line = lines[i];
        var x0 = x-line.x;
        var y0 = y-line.y;
        var a = line.w;
        var b = line.h;
        var c = Math.hypot(a,b);
        var x1 = x0*(a/c)-y0*(-b/c);
        var y1 = x0*(-b/c)+y0*(a/c);
        if(x1 > 0 && x1 < c && y1 > -r && y1 < r){
            //intersection

            //calc the ratio from start xy
            //collision point ratio
            var ratio = (x0*a+y0*b)/c/c;
            var collisionX = line.x+a*ratio;
            var collisionY = line.y+b*ratio;

            result.push({line,ratio,x:collisionX,y:collisionY});
        }else if(Math.hypot(x0,y0) < r){
            var ratio = 0;
            result.push({line,ratio,x:line.x,y:line.y});
        }else if(Math.hypot(x0-line.w,y0-line.h) < r){
            var ratio = 1;
            result.push({line,ratio,x:line.x+line.w,y:line.y+line.h});
        }
    }
    return result;
};



var width = 300;
var height = 500;


addLine(0,0,width,0);
addLine(width,0,0,height);
addLine(width,height,-width,0);
addLine(0,height,0,-height);

addLine(10,10,width-20,0);
addLine(width-10,10,0,height-20);
addLine(10,height-10,0,-height+20);

addLine(130,190,100,50);
addLine(70,290,100,50);

addLine(width/2,height-30,width/2-50,20);
addLine(width/2,height-30,-width/2+50,20);
addLine(10,height-10,40,0);
addLine(width-10,height-10,-40,0);

addHole(100,100,50,150);

addHole(250,270,30,50);

var ball = {
    x:width/2,
    y:height/2,
    vx:10,
    vy:-300,
    r:5,
    m:1,
};


var canvas = BODY.add("canvas").e;
canvas.width = width;
canvas.height = height;
var ctx = canvas.getContext("2d");

var render = function(){
    ctx.clearRect(0,0,width,height);
    ctx.beginPath();
    ctx.arc(ball.x,ball.y,ball.r,0,6.28);
    ctx.closePath();
    ctx.fillStyle = "#000";
    ctx.fill();

    for(var i = 0; i < lines.length; i++){
        var line = lines[i];
        ctx.beginPath();
        ctx.moveTo(line.x,line.y);
        ctx.lineTo(line.x+line.w,line.y+line.h);
        ctx.stroke();
    }
    for(var i = 0; i < holes.length; i++){
        var hole = holes[i];
        ctx.beginPath();
        ctx.arc(hole.x,hole.y,hole.r,0,6.28);
        ctx.closePath();
        ctx.fillStyle = "#000";
        ctx.fill();
        ctx.fillStyle = "#fff";
        var str = (hole.score)+"";
        ctx.font = (hole.r/str.length*2)+"px serif";
        ctx.fillText(hole.score,hole.x-hole.r/2,hole.y+hole.r/3);
    }
};


var g = 500;

var calcpos = function(dt){
    var cx = 0;
    var cy = 0;
    var fx = 0;
    var fy = 0;

    var inters = findLineIntersection(ball);
    for(var i = 0; i < inters.length; i++){
        //correction manuever
        var inter = inters[i];
        var line = inter.line;
        inter.ratio;
        inter.x;
        inter.y;
        var rx = ball.x - inter.x;
        var ry = ball.y - inter.y;
        var r1 = Math.hypot(rx,ry);
        cx += rx*(ball.r-r1)/ball.r;
        cy += ry*(ball.r-r1)/ball.r;

        //calculating the relative velocity of the ball to the line
        //vx vy relative
        var vxref = line.vx-line.dadt*line.h*inter.ratio;
        var vyref = line.vy+line.dadt*line.w*inter.ratio;
        var vxr = ball.vx-vxref;
        var vyr = ball.vy-vyref;
        var projComp = (rx*vxr+ry*vyr)/hypot2(rx,ry);
        var projx = rx*projComp;
        var projy = ry*projComp;
        var vxr1 = (vxr-2*projx*0.9);
        var vyr1 = (vyr-2*projy*0.9);
        ball.vx = vxref+vxr1;
        ball.vy = vyref+vyr1;
        //now reflect these
        //console.log(rx,ry,cx,cy,inter.ratio,line);
    }

    //move the ball
    ball.x += (ball.vx*dt+cx)/1;
    ball.y += (ball.vy*dt+cy)/1;
    ball.vy += ((g+fy/ball.m)*dt)/1;
    ball.vx += ((fx/ball.m)*dt)/1;


    //hole intersection
    for(var i = 0; i < holes.length; i++){
        var hole = holes[i];
        if(Math.hypot(hole.x-ball.x,hole.y-ball.y) < hole.r+ball.r){
            render();
            setTimeout(()=>{alert("game clear, score: "+hole.score)},0);
            return true;
        }
    }
}

var push1 = addLine(30,height-30,40,0);
push1.r = 40;
push1.a = 0;
push1.dadt = 0//-10;
var push2 = addLine(width-30,height-30,-40,0);
push2.r = 40;
push2.a = 3.14;
push2.dadt = 0//10;

var start = 0;
var anim = function(t){
    if(start === 0)start = t;
    var dt = (t - start)/1000;
    start = t;

    //push things
    push1.dadt = (controls.a+controls.b)*40;
    push2.dadt = (controls.c+controls.d)*40;
    push1.a+=push1.dadt*dt;
    push1.w = push1.r*Math.cos(push1.a);
    push1.h = push1.r*Math.sin(push1.a);

    push2.a+=push2.dadt*dt;
    push2.w = push2.r*Math.cos(push2.a);
    push2.h = push2.r*Math.sin(push2.a);

    var itrs = 100;
    for(var i = 0; i < itrs; i++){
        var res = calcpos(dt/itrs);
        if(res){
            return false;
        }
    }
    //render
    render();
    requestAnimationFrame(anim);
};

requestAnimationFrame(anim);

var controls = {
    a:0,
    b:0,
    c:0,
    d:0
};

document.addEventListener("keydown",function(e){
    if(e.which === 90){
        controls.a = -1;
    }else if(e.which === 88){
        controls.b = 1;
    }else if(e.which === 188){
        controls.c = -1;
    }else if(e.which === 190){
        controls.d = 1;
    }
});

document.addEventListener("keyup",function(e){
    if(e.which === 90){
        controls.a = 0;
    }else if(e.which === 88){
        controls.b = 0;
    }else if(e.which === 188){
        controls.c = 0;
    }else if(e.which === 190){
        controls.d = 0;
    }
});