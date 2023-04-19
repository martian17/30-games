var ease = function(x){
    //return 1 - Math.cos((x * Math.PI) / 2);
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
var interpolation = function(a0,a1,r){
    return a0+(a1-a0)*ease(r);
    //return a0+(a1-a0)*r;
};
var floor = function(n,itv){
    return Math.floor(n/itv)*itv;
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
    }
    requestAnimationFrame(animate);
})();



var Game = function(){
    var g = 9.8;//m/s2
    var ship = {
        fuel:30,//seconds
        fuelmax:30,
        mass:200,
        thrust:200*15,
        thrustangle:0,
        w:9,
        h:50,
        x:100,
        y:1500,
        vx:0,
        vy:0
    };
    this.isShipTouchingTheTouchPad = function(){
        if(ship.y < 10 && ship.x > -50 && ship.x < 50){
            return true;
        }
    }
    this.isShipTouchingTheGround = function(){
        return ship.y < 0;//work on it in the future lol
    }
    this.step = function(dt){//in seconds
        ship.x += ship.vx*dt;
        ship.y += ship.vy*dt;
        //collision detection
        if(this.isShipTouchingTheTouchPad()){
            if(ship.vy < -10){
                animation.stop();
                setTimeout(()=>{alert("game over")},100);
            }else{
                animation.stop();
                setTimeout(()=>{alert("game clear")},100);
            }
        }else if(this.isShipTouchingTheGround()){
            animation.stop();
            setTimeout(()=>{alert("game over")},100);
        }
        var fx = 0;
        var fy = -g*ship.mass;
        //calculating the forces
        if(controls.thrust && ship.fuel > 0){
            ship.fuel-=dt;
            var deg = 0;
            if(controls.left){//gimble right
                deg = -10/180*3.14;
            }else if(controls.right){//gimble left
                deg = 10/180*3.14;
            }else{//straight up
                //do nothing
            }
            ship.thrustangle = deg;
            fx += Math.sin(deg)*ship.thrust;
            fy += Math.cos(deg)*ship.thrust;
        }
        console.log(fy);
        ship.vx += fx/ship.mass*dt;
        ship.vy += fy/ship.mass*dt;
    };
    this.ship = ship
    this.render = function(){
        ctx.fillStyle = "#91d7ff";
        ctx.fillRect(0,0,width,height);
        //ship always in the center
        this.cx = ship.x-ship.vx/2;
        this.cy = ship.y-ship.vy/2;
        //draw the grid
        var bx = floor(this.cx-1000,100);
        var by = floor(this.cy-1000,100);
        ctx.strokeStyle = "#fff";
        for(x = bx; x < bx+2000; x+=100){
            ctx.beginPath();
            this._moveTo(x,by);
            this._lineTo(x,by+2000);
            ctx.stroke();
        }
        for(y = by; y < by+2000; y+=100){
            ctx.beginPath();
            this._moveTo(bx,y);
            this._lineTo(bx+2000,y);
            ctx.stroke();
        }

        //drawing the ship
        ctx.fillStyle = "#aaa";
        this._fillRect(ship.x,ship.y,ship.w,ship.h);

        //draw the thrust
        if(controls.thrust && ship.fuel > 0){
            //5 meters diameter
            var dx = 20*Math.sin(ship.thrustangle);
            var dy = 20*Math.cos(ship.thrustangle);
            ctx.beginPath();
            this._moveTo(ship.x+2,ship.y);
            this._lineTo(ship.x-dx+4.5,ship.y-dy);
            this._lineTo(ship.x+7,ship.y);
            ctx.closePath()
            ctx.fillStyle = "#f9ce8c";
            ctx.fill();
        }

        //draw the touchpad
        ctx.fillStyle = "#eee";
        this._fillRect(-50,0,100,10);

        //draw the ground
        ctx.fillStyle = "#58d624";
        this._fillRect(-10000,-1000,20000,1000);
        //fuel gauge
        ctx.strokeStyle = "#fff";
        ctx.strokeRect(10,10,100,10);
        ctx.fillStyle = "#0f0";
        ctx.fillRect(10,10,100*ship.fuel/ship.fuelmax,10);
        //ship info
        ctx.fillStyle = "#000"
        ctx.font =`10px "Courier New", Courier, monospace`;
        ctx.fillText("Landing pad at x=0, y=0.",10,40);
        ctx.fillText("Slow the starship down and land it before the fuel runs out",10,50);
        ctx.fillText("x:  "+Math.floor(ship.x),10,70);
        ctx.fillText("y:  "+Math.floor(ship.y),10,80);
        ctx.fillText("vx: "+Math.floor(ship.vx),10,90);
        ctx.fillText("vy: "+Math.floor(ship.vy),10,100);
        ctx.fillText("thrust: ↑key",10,120);
        ctx.fillText("left:   ←key",10,130);
        ctx.fillText("right:  →key",10,140);
    };
    this.zoom = 1;
    this._fillRect = function(x,y,w,h){
        ctx.beginPath();
        this._moveTo(x,y);
        this._lineTo(x+w,y);
        this._lineTo(x+w,y+h);
        this._lineTo(x,y+h);
        ctx.closePath();
        ctx.fill();
        /*ctx.fillRect(
            (x-this.cx)*this.zoom+width/2,
            (height-((y-this.cy)*this.zoom+height/2)),
            w*this.zoom,
            h*this.zoom
        );*/
    };
    this._moveTo = function(x,y){
        ctx.moveTo(
            (x-this.cx)*this.zoom+width/2,
            (height-((y-this.cy)*this.zoom+height/2))
        );
    };
    this._lineTo = function(x,y){
        ctx.lineTo(
            (x-this.cx)*this.zoom+width/2,
            (height-((y-this.cy)*this.zoom+height/2))
        );
    };

};



var width = 500;
var height = 500;

BODY.add("style",`
.display{
    display:inline-block;
    text-align:center;
    font-size:30px;
    padding:10px 20px;
}
`);
var display = BODY.add("div",false,"class:display").e;
BODY.add("br");
var canvas = BODY.add("canvas").e;
canvas.width = width;
canvas.height = height;
var ctx = canvas.getContext("2d");


var game = new Game();

//controls
var controls = {
    left:false,
    right:false,
    thrust:false
};

document.addEventListener("keydown",function(e){
    if(e.which === 37){
        controls.left = true;
    }else if(e.which === 39){
        controls.right = true;
    }else if(e.which === 38){
        controls.thrust = true;
    }
});

document.addEventListener("keyup",function(e){
    if(e.which === 37){
        controls.left = false;
    }else if(e.which === 39){
        controls.right = false;
    }else if(e.which === 38){
        controls.thrust = false;
    }
});


animation.frame = function(dt){
    game.step(dt/1000);
    game.render();
};

game.gameClear = ()=>{
    setTimeout(()=>alert("game clear"),10);
};
game.gameOver = ()=>{
    setTimeout(()=>alert("game over"),10);
};