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
        that.frame(dt,t);
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
})();


var dist2 = function(x,y){
    return x*x+y*y;
};

var randomid = function(){
    return Math.random().toString(36).slice(2);
}

var Rect = function(params){
    this.x = 0;
    this.y = 0;
    this.a = 1;
    this.vx = 0;
    this.vy = 0;
    this.va = 0;
    this.w = 9;
    this.h = 30;
    this.r = 15;
    this.mass = 200;
    for(var key in params){
        this[key] = params[key];
    }
    this.MI = this.mass*dist2(this.w,this.h)/3;
    
    this.applyForce = function([fx,fy],[x,y],dt){
        this.vx+=fx*dt/this.mass;
        this.vy+=fy*dt/this.mass;
        //calculate the torque
        var xr = x-this.x;
        var yr = y-this.y;
        
        var torque = 0;
        if(fx !== 0){
            var r = yr-xr*fy/fx;
            var f = fx;
            torque = r*f;
        }else if(fy !== 0){
            var r = xr-yr*fx/fy;
            var f = fy;
            torque = r*f;
        }else{
            //No force, do nothing
        }
        var aa = -torque/this.MI;
        this.va+=aa*dt;
    };
    
    this.relToAbs = function(x,y){
        var cos = Math.cos(this.a);
        var sin = Math.sin(this.a);
        var x1 = this.x+x*cos-y*sin;
        var y1 = this.y+x*sin+y*cos;
        return [x1,y1];
    };
};

var sigmoid = function(val,max){
    return Math.atan(1/max*val*1.57)/(1/max*1.57)
};

var Game = function(canvas,ctx){
    var width = canvas.width;
    var height = canvas.height;
    var G = 6.67408e-11;
    
    this.ships = [];
    this.projectiles = [];
    
    var star = {
        x:width/2,
        y:height/2,
        mass:29.8*100*100/G,
        r:10,
        color:"#fff"
    };
    
    this.addShip = function(col,params){//return ship
        var ship = new Rect(params);
        ship.thrust = false;
        ship.left = false;
        ship.right = false;
        ship.fire = false;
        ship.color = col;
        ship.gimbal = 50*3.14/180;
        ship.tmagn = 200*35;
        this.ships.push(ship);
        ship.lastFire = 0;
        ship.normalizeVelocity = function(max=100){
            var vv = Math.hypot(this.vx,this.vy);
            var vv1 = sigmoid(vv,max);
            //console.log(this,vv,vv1);
            if(vv < max)return false;
            this.vx = ship.vx/vv*vv1;
            this.vy = ship.vy/vv*vv1;
        }
        return ship;
    };
    
    this.bullets = {};
    
    this.step = function(dt,t){
        
        //bullets
        for(var key in this.bullets){
            var bullet = this.bullets[key];
            if(t-bullet.created > 1000){
                delete this.bullets[key];
                continue;
            }
            bullet.x += bullet.vx*dt;
            bullet.y += bullet.vy*dt;
            
            bullet.x = (bullet.x+width)%width;
            bullet.y = (bullet.y+height)%height;
            for(var i = 0; i < this.ships.length; i++){
                var ship = this.ships[i];
                if(Math.hypot(ship.x-bullet.x,ship.y-bullet.y) < ship.r+bullet.r){
                    console.log("hit");
                    if(ship === ship1){
                        setTimeout(()=>{alert("blue ship wins");},100);
                    }else if(ship === ship2){
                        setTimeout(()=>{alert("red ship wins");},100);
                    }
                    animation.frame = ()=>{};
                    return false;
                }
            }
        }
        
        for(var i = 0; i < this.ships.length;i++){
            var ship = this.ships[i];
            if(ship.thrust){
                var thrustAngle = ship.a;
                if(ship.left){
                    thrustAngle += ship.gimbal;
                }
                if(ship.right){
                    thrustAngle -= ship.gimbal;
                }
                var tmagn = ship.tmagn;
                var tx = -tmagn*Math.sin(thrustAngle);
                var ty = tmagn*Math.cos(thrustAngle);
                
                var originx = ship.x + ship.h/2*Math.sin(ship.a);
                var originy = ship.y - ship.h/2*Math.cos(ship.a);
                ship.applyForce([tx,ty],[originx,originy],dt);
            }
            //if(ship === ship2)console.log(ship.fire);
            if(ship.fire){
                if(t-ship.lastFire > 500){
                    //this.bullets
                    console.log("fire");
                    ship.lastFire = t;
                    var id = randomid();
                    var [x,y] = ship.relToAbs(0,20);
                    this.bullets[id] = {
                        x,y,
                        vx:-Math.sin(ship.a)*400,
                        vy:Math.cos(ship.a)*400,
                        created:t,
                        color:"#fff",
                        r:3
                    };
                }
            }
            
            //gravity from the star
            var r = Math.hypot(star.x-ship.x,star.y-ship.y);
            var FG = G*star.mass*ship.mass/((r+20)**2);
            ship.applyForce([FG*(star.x-ship.x)/r,FG*(star.y-ship.y)/r],[ship.x,ship.y],dt);
            
            ship.normalizeVelocity(200);
            
            ship.x += ship.vx*dt;
            ship.y += ship.vy*dt;
            ship.a += ship.va*dt;
            
            ship.x = (ship.x+width)%width;
            ship.y = (ship.y+height)%height;
            ship.a = (ship.a+Math.PI*2)%(Math.PI*2);
        }
    };
    
    this.render = function(){
        ctx.clearRect(0,0,width,height);
        ctx.fillStyle = "#002";
        ctx.fillRect(0,0,width,height);
        
        //draw the star
        ctx.beginPath();
        ctx.arc(star.x,star.y,star.r,0,6.28);
        ctx.closePath();
        ctx.fillStyle = star.color;
        ctx.fill();
        
        //draw the bullets
        for(var key in this.bullets){
            var bullet = this.bullets[key];
            ctx.beginPath();
            ctx.arc(bullet.x,bullet.y,bullet.r,0,6.28);
            ctx.closePath();
            ctx.fillStyle = bullet.color;
            ctx.fill();
        }
        
        for(var i = 0; i < this.ships.length; i++){
            var ship = this.ships[i];
            var kernels = [[1,1],[-1,1],[-1,-1],[1,-1]];
            var cos = Math.cos(ship.a);
            var sin = Math.sin(ship.a);
            ctx.beginPath();
            for(var j = 0; j < kernels.length; j++){
                var kernel = kernels[j];
                var x = kernel[0]*ship.w/2;
                var y = kernel[1]*ship.h/2;
                //now rotate these to match the ships angle and offset
                ctx.lineTo(...ship.relToAbs(x,y));
            }
            ctx.strokeStyle = ship.color || "#aaa";
            ctx.closePath();
            ctx.stroke();
            
            //drawing the ship exhaust
            var thrustAngle = 0;//ship.a;
            if(ship.left){
                thrustAngle -= ship.gimbal;
            }
            if(ship.right){
                thrustAngle += ship.gimbal;
            }
            ctx.beginPath();
            ctx.lineTo(...ship.relToAbs(-2,-ship.h/2));
            ctx.lineTo(...ship.relToAbs(2,-ship.h/2));
            ctx.lineTo(...ship.relToAbs(10*3.14/180-thrustAngle*20,-ship.h/2-20));
            ctx.closePath();
            ctx.fillStyle = "#91d7ff";
            if(ship.thrust)ctx.fill();
        }
    };
};


var canvas = document.createElement("canvas");
canvas.width = 500;
canvas.height = 500;
var ctx = canvas.getContext("2d");
document.body.appendChild(canvas);

var game = new Game(canvas,ctx);

var ship1 = game.addShip("#f00",{x:100,y:100,vx:-10,vy:10,a:0});
var ship2 = game.addShip("#00f",{x:400,y:400,vx:10,vy:-10,a:3.14});


document.addEventListener("keydown",function(e){
    if(e.which === 65){
        ship1.left = true;
    }else if(e.which === 68){
        ship1.right = true;
    }else if(e.which === 87){
        ship1.thrust = true;
    }else if(e.which === 83){
        ship1.fire = true;
    }else if(e.which === 74){
        ship2.left = true;
    }else if(e.which === 76){
        ship2.right = true;
    }else if(e.which === 73){
        ship2.thrust = true;
    }else if(e.which === 75){
        ship2.fire = true;
    }
});

document.addEventListener("keyup",function(e){
    if(e.which === 65){
        ship1.left = false;
    }else if(e.which === 68){
        ship1.right = false;
    }else if(e.which === 87){
        ship1.thrust = false;
    }else if(e.which === 83){
        ship1.fire = false;
    }else if(e.which === 74){
        ship2.left = false;
    }else if(e.which === 76){
        ship2.right = false;
    }else if(e.which === 73){
        ship2.thrust = false;
    }else if(e.which === 75){
        ship2.fire = false;
    }
});

animation.frame = function(dt,t){
    game.step(dt/1000,t);
    game.render();
};
