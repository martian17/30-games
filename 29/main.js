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

var dist2 = function(x,y){
    return x*x+y*y;
}

var proj = function(v1,v2){//v1 is the will be magn vector
    var k = (v1[0]*v2[0]+v1[1]*v2[1])/(v1[0]*v1[0]+v1[1]*v1[1]);
    return [k*v1[0],k*v1[1]];
};

var projmagn = function(v1,v2){
    return (v1[0]*v2[0]+v1[1]*v2[1])/Math.hypot(v1[0],v1[1]);
};

var vecr2 = function([fx,fy],[x0,y0],[x,y]){
    var v1 = [x-x0,y-y0];
    var v2 = proj([fx,fy],v1);
    return dist2(v2[0]-v1[0],v2[1]-v1[1]);
};



var Game = function(canvas,ctx,width,height){
    var G = 6.67408e-11;
    var earth = {
        r:10000,//10000m small planet
        x:0,
        y:0,
        mass:0
    };
    earth.mass = 29.8*earth.r*earth.r/G;
    
    var ship = {
        fuel:30,//seconds
        fuelmax:60,
        mass:200,
        thrust:200*55,
        gimbal:30*3.14/180,
        w:9,
        h:50,
        x:0,
        y:0,//cg
        a:0,
        vx:0,
        vy:0,
        va:0,
        MI:1,
        applyForce:function([fx,fy],[x,y],dt,sign){
            
            if(sign){
                console.log(ship.x-x,ship.y-y);
                console.log(fx,fy);
                console.log((ship.x-x)/fx,(ship.y-y)/fy);
            }
            
            //var fx = Math.cos(angle)*f;
            //var fy = Math.sin(angle)*f;
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
        }
    };
    ship.MI = ship.mass*dist2(ship.w,ship.h)/3;
    ship.y = earth.r+ship.h/2+100;//just enough to stand on it
    
    var ball = {
        x:0,y:-earth.r-100,r:100
    };
    
    this.step = function(dt){//in seconds
        ship.x += ship.vx*dt;
        ship.y += ship.vy*dt;
        ship.a += ship.va*dt;
        ship.a = ship.a%(2*Math.PI)
        
        //controls
        if(controls.thrust){
            //thrust angle
            var sss = true;
            var thrustAngle = ship.a;
            if(controls.left){
                thrustAngle += ship.gimbal;
            }
            if(controls.right){
                thrustAngle -= ship.gimbal;
                sss = false;
            }
            //console.log(thrustAngle);
            var tvec = [-ship.thrust*Math.sin(thrustAngle),ship.thrust*Math.cos(thrustAngle)];
            var origin = [ship.x+ship.h/2*Math.sin(ship.a),ship.y-ship.h/2*Math.cos(ship.a)];
            ship.applyForce(tvec,origin,dt,sss);
            //var tvec = (ship.a+1.57)
            //ship.thrust
        }
        //gravity
        var rcenter = Math.hypot((earth.x-ship.x),(earth.y-ship.y))
        var GF = G*ship.mass*earth.mass/rcenter/rcenter;
        ship.applyForce([GF*(earth.x-ship.x)/rcenter,GF*(earth.y-ship.y)/rcenter],[ship.x,ship.y],dt);
        
        //if on earth, apply force on the collision
        
        var kernels = [[1,1],[-1,1],[-1,-1],[1,-1]];
        var cos = Math.cos(ship.a);
        var sin = Math.sin(ship.a);
        var colpoints = [];
        for(var i = 0; i < kernels.length; i++){
            var kernel = kernels[i];
            var x = kernel[0]*ship.w/2;
            var y = kernel[1]*ship.h/2;
            //now rotate these to match the ships angle and offset
            var x1 = ship.x+x*cos-y*sin;
            var y1 = ship.y+x*sin+y*cos;
            if(dist2(x1-earth.x,y1-earth.y) < earth.r*earth.r){//collision
                colpoints.push([x1,y1]);
            }
        }
        if(dist2(ball.x-ship.x,ball.y-ship.y) < ball.r*ball.r)alert("game clear");
        var len = colpoints.length;
        if(len !== 0){
            //alert("game over");
            //return false;
            var vrelative = projmagn([earth.x-ship.x,earth.y-ship.y],[ship.vx,ship.vy]);
            var fTotal = 0;
            if(!ship.collided){
                //console.log(vrelative,dt);
                //fTotal = vrelative/dt*ship.mass*1.5;
            }
            for(var i = 0; i < len; i++){
                var [x,y] = colpoints[i];
                var rr = Math.hypot(x,y);
                //sink spring
                var sink = earth.r-rr;
                var sinkf = sink*ship.mass*500;//adjustable
                if(vrelative < 0)sinkf /= 5;
                ship.applyForce([(sinkf+fTotal/len)*(x-earth.x)/rr,(sinkf+fTotal/len)*(y-earth.y)/rr],[x,y],dt);
                //ship.applyForce([fTotal/len*(x-earth.x)/rr,fTotal/len*(y-earth.y)/rr],[x,y],dt);
            }
            ship.collided = true;
        }else{
            ship.collided = false;
        }
        
    };
    this.ship = ship;
    
    var lineToRelShip = function(x,y){
        var cos = Math.cos(ship.a);
        var sin = Math.sin(ship.a);
        var x1 = ship.x+x*cos-y*sin;
        var y1 = ship.y+x*sin+y*cos;
        ctx.lineTo(x1,y1);
    };
    
    this.render = function(){
        //ctx.setTransform(1,0,0,1,-ship.x+width/2,-ship.y+height/2);
        //ctx.setTransform(1,0,0,1,-ship.x-width/2,-ship.y-height/2);
        //ctx.translate(-ship.x+width/2,-ship.y+height/2);
        ctx.setTransform(1,0,0,1,0,0);
        ctx.fillStyle = "#002";
        ctx.clearRect(0,0,width,height);
        ctx.fillRect(0,0,width,height);
        
        ctx.translate(width/2,height/2);
        ctx.rotate(Math.atan2(ship.x,ship.y)+3.14159265);
        ctx.translate(-ship.x,-ship.y);
        //ctx.rotate(Math.atan2(ship.x,ship.y));
        
        //ball
        ctx.fillStyle = "#f00";
        ctx.beginPath();
        ctx.arc(ball.x,ball.y,ball.r,0,6.28);
        ctx.closePath();
        ctx.fill();
        
        //earth
        ctx.fillStyle = "#91d7ff";
        ctx.beginPath();
        ctx.arc(earth.x,earth.y,earth.r,0,6.28);
        ctx.closePath();
        ctx.fill();
        
        //drawing the ship exhaust
        var thrustAngle = 0;//ship.a;
        if(controls.left){
            thrustAngle -= ship.gimbal;
        }
        if(controls.right){
            thrustAngle += ship.gimbal;
        }
        ctx.beginPath();
        lineToRelShip(-2,-ship.h/2);
        lineToRelShip(2,-ship.h/2);
        lineToRelShip(10*3.14/180-thrustAngle*20,-ship.h/2-20);
        ctx.closePath();
        ctx.fillStyle = "#91d7ff";
        if(controls.thrust)ctx.fill();
        
        //drawing the ship
        ctx.beginPath();
        var kernels = [[1,1],[-1,1],[-1,-1],[1,-1]];
        var cos = Math.cos(ship.a);
        var sin = Math.sin(ship.a);
        for(var i = 0; i < kernels.length; i++){
            var kernel = kernels[i];
            var x = kernel[0]*ship.w/2;
            var y = kernel[1]*ship.h/2;
            //now rotate these to match the ships angle
            var x1 = ship.x+x*cos-y*sin;
            var y1 = ship.y+x*sin+y*cos;
            ctx.lineTo(x1,y1);
        }
        ctx.fillStyle = "#aaa";
        ctx.closePath();
        ctx.fill();
        
        //earth longitudes
        var len = 100;
        for(var i = 0; i < len; i++){
            var a = i/len*3.14159265*2;
            ctx.strokeStyle = "#fff"
            ctx.beginPath();
            ctx.moveTo(0,0);
            ctx.lineTo(50000*Math.cos(a),50000*Math.sin(a));
            ctx.stroke();
            //ctx.beginPath();
            //ctx.arc(earth.x,earth.y,earth.r+i*(earth.r/len)*6,0,6.28);
            //ctx.closePath();
            //ctx.stroke();
        }
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


var game = new Game(canvas,ctx,width,height);

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
    //game.render();
    
    game.render();
};

game.gameClear = ()=>{
    setTimeout(()=>alert("game clear"),10);
};
game.gameOver = ()=>{
    setTimeout(()=>alert("game over"),10);
};