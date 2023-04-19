var hypot2 = function(a,b){
    return a*a+b*b;
};

var animation = new (function(){
    var resolveFrame = [];
    this.nextFrame = function(){
        return new Promise((resolve,reject)=>{
            resolveFrame.push(resolve);
        });
    };
    this.transition = async function(duration,func){
        var t = 0;
        while(t < duration){
            func(t/duration);
            var dt = await this.nextFrame();
            t += dt;
        }
        func(1);
        return true;
    }
    this.sleep = function(t){
        return new Promise((resolve,reject)=>{
            setTimeout(resolve,t);
        });
    };
    this.isStop = false;
    this.stop = function(){
        this.isStop = true;
    }
    this.resume = function(){
        this.isStop = false;
        requestAnimationFrame(this.animate);
    }
    this.frame = function(){};
    var that = this;
    var start = 0;
    animate = function(t){
        if(start === 0)start = t;
        var dt = t - start;
        start = t;
        if(that.isStop){
            return false;
        }
        for(var i = 0; i < resolveFrame.length; i++){
            resolveFrame[i](dt);
        }
        resolveFrame = [];
        that.frame(dt);
        requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
})();

var Game = function(){
    this.lines = [];
    this.balls = [];
    this.addLine = function(x,y,w,h){
        var line = {
            x,y,w,h,vx:0,vy:0,dadt:0
        };
        this.lines.push(line);
        return line;
    };
    this.addBall = function(x,y,vx,vy,r=5){
        var ball = {
            x,
            y,
            vx,
            vy,
            r,
            m:1,
        };
        this.balls.push(ball);
        return ball;
    };
    this.findLineIntersection = function(ball){
        var r = ball.r;
        var x = ball.x;
        var y = ball.y;
        var result = [];
        for(var i = 0; i < this.lines.length; i++){
            var line = this.lines[i];
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

    this.render = function(){
        ctx.clearRect(0,0,width,height);
        //rendering balls
        ctx.fillStyle = "#000";
        for(var i = 0; i < this.balls.length; i++){
            var ball = this.balls[i];
            ctx.beginPath();
            ctx.arc(ball.x,ball.y,ball.r,0,6.28);
            ctx.closePath();
            ctx.fill();
        }

        for(var i = 0; i < this.lines.length; i++){
            var line = this.lines[i];
            ctx.beginPath();
            ctx.moveTo(line.x,line.y);
            ctx.lineTo(line.x+line.w,line.y+line.h);
            ctx.stroke();
        }

        //render cannon
        ctx.beginPath();
        ctx.arc(this.cannon.x,this.cannon.y,this.cannon.r,0,6.28);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(this.cannon.x,this.cannon.y);
        ctx.lineTo(this.cannon.x+100*Math.sin(this.cannon.angle),this.cannon.y+100*Math.cos(this.cannon.angle));
        ctx.stroke();
    };


    var g = 600;

    this.step = function(dt){

        for(var i = 0; i < this.balls.length; i++){
            var ball = this.balls[i];
            var cx = 0;
            var cy = 0;
            var fx = 0;
            var fy = 0;
            var inters = this.findLineIntersection(ball);
            for(var j = 0; j < inters.length; j++){
                //correction manuever
                var inter = inters[j];
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
                var vxr1 = (vxr-2*projx*0.7);
                var vyr1 = (vyr-2*projy*0.7);
                ball.vx = vxref+vxr1;
                ball.vy = vyref+vyr1;
                //now reflect these
                //console.log(rx,ry,cx,cy,inter.ratio,line);
            }

            //move the ball
            ball.x += cx;//(ball.vx*dt+cx)/1;
            ball.y += cy;//(ball.vy*dt+cy)/1;
            ball.vy += (g+fy/ball.m)*dt//((g+fy/ball.m)*dt)/1;
            ball.vx += (fx/ball.m)*dt//((fx/ball.m)*dt)/1;
        }


        //ball intersection
        for(var i = 0; i < this.balls.length; i++){
            var b1 = this.balls[i];
            for(var j = i+1; j < this.balls.length; j++){
                var b2 = this.balls[j];
                if(hypot2(b1.x-b2.x,b1.y-b2.y) < (b1.r+b2.r)*(b1.r+b2.r)){//collision detected
                    var Bx = b2.x-b1.x;
                    var By = b2.y-b1.y;
                    var alphal = ((b1.vx-b2.vx)*Bx+(b1.vy-b2.vy)*By)/(Bx*Bx+By*By)/2*0.9;
                    var alphax = alphal*Bx;
                    var alphay = alphal*By;

                    b1.vx = b1.vx-2*alphax;
                    b1.vy = b1.vy-2*alphay;
                    b2.vx = b2.vx+2*alphax;
                    b2.vy = b2.vy+2*alphay;
                    continue;
                }
            }
        }
        for(var i = 0; i < this.balls.length; i++){
            var ball = this.balls[i];
            ball.x += ball.vx*dt;
            ball.y += ball.vy*dt;
        }
    };
    this.cntScore = function(){
        return this.balls.filter(b=>{
            return b.y<300;
        }).length
    }
    this.cannon = {
        x:150,
        y:450,
        dir:1,
        angle:3,
        dira:1,
        r:15
    };

    //initialization code
    this.startGame = async function(){
        if(controls.fire){
            controls.fire = false;
            this.addBall(this.cannon.x,this.cannon.y,100*Math.sin(this.cannon.angle),100*Math.cos(this.cannon.angle),15);
        }
    }
    var over = false;
    var cnt = 0;
    this.frame = function(dt){
        //move the cannon
        if(this.cannon.x < 150){
            this.cannon.dir = 1;
        }
        if(this.cannon.x > 850){
            this.cannon.dir = -1;
        }
        this.cannon.x+=this.cannon.dir*dt*200;

        if(this.cannon.angle < 2.1){
            this.cannon.dira = 1;
        }
        if(this.cannon.angle > 4.3){
            this.cannon.dira = -1;
        }
        this.cannon.angle+=this.cannon.dira*dt*1;



        if(controls.fire && !over){
            controls.fire = false;
            var vvv = 800;
            this.addBall(this.cannon.x,this.cannon.y,vvv*Math.sin(this.cannon.angle),vvv*Math.cos(this.cannon.angle),15);
            cnt++
            if(cnt > 10){
                console.log("all the balls");
                over = true;
                setTimeout(()=>{
                    alert("Score: "+this.cntScore())
                },3000);
            }
        }

        var itrs = 100;
        for(var i = 0; i < itrs; i++){
            this.step(dt/itrs);
        }
        //render
        this.render();
    }

};


var width = 1000;
var height = 500;

var game = new Game();
game.addLine(width/2-50,300,100,0);
game.addLine(width/2-50,300,0,-100);
game.addLine(width/2+50,300,0,-100);


var canvas = BODY.add("canvas").e;
canvas.width = width;
canvas.height = height;
var ctx = canvas.getContext("2d");

var start = 0;
var anim = function(t){
    if(start === 0)start = t;
    var dt = (t - start)/1000;
    start = t;

    game.frame(dt);

    /*if(controls.fire){
        controls.fire = false;
        game.addBall(game.cannon.x,game.cannon.y,500*Math.sin(game.cannon.angle),500*Math.cos(game.cannon.angle),15);
    }

    var itrs = 100;
    for(var i = 0; i < itrs; i++){
        game.step(dt/itrs);
    }
    //render
    game.render();*/
    requestAnimationFrame(anim);
};

requestAnimationFrame(anim);

//var ball1 = game.addBall(500,100,0,0,15);
//var ball2 = game.addBall(500,60,1,0,15);
//console.log(ball1,ball2);



var controls = {
    a:0,
    b:0,
    c:0,
    d:0
};

document.addEventListener("keydown",function(e){
    if(e.which === 32){
        controls.fire = true;
    }
    /*if(e.which === 90){
        controls.a = -1;
    }else if(e.which === 88){
        controls.b = 1;
    }else if(e.which === 188){
        controls.c = -1;
    }else if(e.which === 190){
        controls.d = 1;
    }*/
});

document.addEventListener("keyup",function(e){
    if(e.which === 32){
        controls.fire = false;
    }
    /*if(e.which === 90){
        controls.a = 0;
    }else if(e.which === 88){
        controls.b = 0;
    }else if(e.which === 188){
        controls.c = 0;
    }else if(e.which === 190){
        controls.d = 0;
    }*/
});