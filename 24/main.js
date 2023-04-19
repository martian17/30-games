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
            resolveFrame[i]({dt,t});
        }
        resolveFrame = [];
        that.frame(dt);
        requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
})();

var interpolate = function(a0,a1,r){
    r =  Math.sin((r * Math.PI) / 2);
    return a0+(a1-a0)*r;
};

var setPromiseEvent = function(elem,name){
    var res;
    elem.addEventListener(name,(e)=>{
        var result = {
            x:e.clientX-elem.offsetLeft+window.scrollX,
            y:e.clientY-elem.offsetTop+window.scrollY
        };
        if(res)res(result);//only fires once
        res = false;
    });
    return function(){
        return new Promise((resolve,reject)=>{
            res = resolve;
        });
    };
};

var randomid = function(){
    return Math.floor(Math.random()*4294967296-2147483648);//32 bit random int
}

var friendlyTargets = {
    friendly:true
};
var hostileTargets = {
    hostile:true
};

var colliding = function(o1,o2){
    var dx = o1.x-o2.x;
    var dy = o1.y-o2.y;
    return (o1.r+o2.r)*(o1.r+o2.r) > (dx*dx+dy*dy);
};

var rotate = function(x,y,a){
    var x1 = x*Math.cos(a)-y*Math.sin(a);
    var y1 = x*Math.sin(a)+y*Math.cos(a);
    return {x1,y1};
};


var Collision = function(span){//structure generated every frame
    var objs = [];
    this.addObj = function(o){
        objs.push(o);
    }
    this.findCollision = function(){
        var table = {};
        for(var i = 0; i < objs.length; i++){
            var o = objs[i];
            var xidx0 = Math.floor((o.x-o.r)/span);
            var yidx0 = Math.floor((o.y-o.r)/span);
            var xidx1 = Math.floor((o.x+o.r)/span);
            var yidx1 = Math.floor((o.y+o.r)/span);
            for(var xi = xidx0; xi <= xidx1; xi++){
                for(var yi = yidx0; yi <= yidx1; yi++){
                    var idx = xi^(yi<<16);
                    if(!(idx in table))table[idx] = [];
                    table[idx].push(o);
                }
            }
        }
        var examined = {};//dynamic
        var pairs = [];
        for(var key in table){
            var cell = table[key];
            if(cell.length === 0){
                continue;
            }
            //brute force within the cell
            for(var i = 0; i < cell.length; i++){
                for(var j = i+1; j < cell.length; j++){
                    var o1 = cell[i];
                    var o2 = cell[j];
                    if((o1.id^o2.id) in examined)continue;
                    examined[o1.id^o2.id] = true;
                    if(colliding(o1,o2)){
                        pairs.push([o1,o2]);
                    }
                }
            }
        }
        return pairs;
    };
};

var cntt = 0;
var Cannon = function(p,game){
    this.id = randomid();
    this.type = "cannon";
    this.noCollision = true;
    this.a0 = p.a0 || 0;
    this.x0 = p.x0 || 0;
    this.y0=p.y0 || 10;
    this.w=p.w || 5;
    this.h=p.h || 20;
    this.itv= p.itv ||1000;
    this.cooldown = p.cooldown || 1000*Math.random();
    this.lastFire = 0;
    this.x = 0;
    this.y = 0;
    this.a = 0;
    this.group = p.group || "hostile";
    this.bulletParams = p.bulletParams || {
        r:5,
        v:1,
        damage:10,
        exclude:hostileTargets
    };
    this.fire = function(t){
        cntt++;
        if(t-this.lastFire > this.itv){
            this.lastFire = t;
            //generate bullet
            var b = new Bullet(this,game);
            //b not used only sideffect

            if(cntt< 1000)console.log(b);
        }
    };
    game.objs[this.id] = this;
};

var Bullet = function(cannon,game){
    this.id = randomid();
    if(cntt< 1000)console.log("asdfasd");
    this.type = "bullet";
    var bp = cannon.bulletParams;
    this.exclude = bp.exclude;
    this.x = cannon.x;
    this.y = cannon.y;
    this.r = bp.r;
    this.damage = bp.damage || 10;
    this.vx = -bp.v*Math.sin(cannon.a);
    this.vy = bp.v*Math.cos(cannon.a);
    game.objs[this.id] = this;
    this.delete = function(){
        delete game.objs[this.id];
    }
    this.rectifyPosition = ()=>{};
};

var Ship = function(params,game){
    this.id = randomid();
    this.onframe = params.onframe || function(){};
    this.type = "ship";
    this.group = params.group || "hostile";
    this.r = params.r || 10;
    this.x = params.x || 0;
    this.y = params.y || 0;
    this.a = 0;
    this.vx = 0;
    this.vy = 0;
    this.health = 19 || params.health;

    if("cannons" in params){
        this.cannons = params.cannons;
    }else{
        this.cannons = {};
        var cannon = new Cannon({},game);
        this.cannons[cannon.id] = cannon;
    }
    this.rectifyPosition = function(){
        for(var id in this.cannons){
            var cannon = this.cannons[id];
            var {x1,y1} = rotate(cannon.x0,cannon.y0,this.a);
            cannon.x = this.x+x1;
            cannon.y = this.y+y1;
            cannon.a = this.a+cannon.a0;
        }
    };
    game.objs[this.id] = this;
    this.delete = function(){
        delete game.objs[this.id];
        for(var key in this.cannons){
            var cannon = this.cannons[key];
            delete game.objs[cannon.id];
        }
    }
};

var Game = function(ctx,width,height){
    this.objs = {};
    var game = this;
    var lastEnemy;

    this.getCollisionPairs = function(){
        var collision = new Collision(60);
        for(var key in this.objs){
            if(this.objs[key].noCollision === true)continue;
            collision.addObj(this.objs[key]);
        }
        return collision.findCollision();
    };
    var meFrame = function(dt,t){
        //console.log(dt,t);
        if(controls.left){
            this.a-=dt*3;
        }
        if(controls.right){
            this.a+=dt*3;
        }
        if(controls.forward){
            this.vx = -3*Math.sin(this.a);
            this.vy = 3*Math.cos(this.a);
        }else{
            this.vx = 0;
            this.vy = 0;
        }
        //fire front
        for(var key in this.cannons){
            var cannon = this.cannons[key];
            console.log(lastEnemy);
            cannon.a = cannon.a0-Math.atan2(lastEnemy.x-me.x,lastEnemy.y-me.y);
            cannon.fire(t);
        }
        if(Object.keys(enemies).length === 0){
            alert("game clear");
        }
    }
    var me = new Ship({
        health:39,
        group:"friendly",
        onframe:meFrame,
        cannons:{
            front:(new Cannon({
                bulletParams:{
                    r:5,
                    v:4,
                    damage:30,
                    exclude:friendlyTargets
                }
            },game))
        }
    },game);
    var that = this;
    var enemyFrame = function(dt,t){
        //locate me and go towards it
        this.a = -Math.atan2(me.x-this.x,me.y-this.y);
        this.vx = -0.5*Math.sin(this.a);
        this.vy = 0.5*Math.cos(this.a);
        lastEnemy = this;
        for(var key in this.cannons){
            var cannon = this.cannons[key];
            cannon.fire(t);
        }
    }

    var enemies = {};

    for(var i = 0; i < 10; i++){
        var enemy = new Ship({
            onframe:enemyFrame,
            x:Math.random()*1000,
            y:Math.random()*1000
        },game);
        console.log(enemy);
        enemies[enemy.id] = enemy;
    }

    this.render = function(){
        ctx.clearRect(0,0,width,height);
        ctx.x = me.x;
        ctx.y = me.y;//ctx is a wrapper
        ctx.a = me.a+3.14;

        for(var key in this.objs){
            var o = this.objs[key];
            if(o.type === "cannon"){
                ctx.beginPath();
                var {x1,y1} = rotate(-o.w/2,0,o.a);
                ctx.moveTo1(o.x+x1,o.y+y1);
                var {x1,y1} = rotate(o.w/2,0,o.a);
                ctx.lineTo1(o.x+x1,o.y+y1);
                var {x1,y1} = rotate(o.w/2,o.h,o.a);
                ctx.lineTo1(o.x+x1,o.y+y1);
                var {x1,y1} = rotate(-o.w/2,o.h,o.a);
                ctx.lineTo1(o.x+x1,o.y+y1);
                ctx.closePath();
                ctx.stroke();
            }else{
                ctx.beginPath();
                ctx.arc1(o.x,o.y,o.r,0,6.28);
                ctx.closePath();
                ctx.stroke();
            }
        }
    }

    this.step = function(dt,t){
        for(var key in this.objs){//moving them
            var obj = this.objs[key];
            if(obj.type === "cannon")continue;
            obj.x += obj.vx;
            obj.y += obj.vy;
            obj.rectifyPosition();
            if(obj.type === "ship"){
                obj.onframe(dt,t);
            }
        }
        var pairs = this.getCollisionPairs();
        for(var i = 0; i < pairs.length; i++){
            var pair = pairs[i];
            if(pair[0].type === "ship" && pair[1].type === "ship"){//ship on ship
                //ramming does nothing, lazy ass
            }else if(pair[0].type === "bullet" && pair[1].type === "bullet"){//bullet on bullet
                var b1 = pair[0];
                var b2 = pair[1];
                if(!(b1.group in b2.exclude)){
                    b1.delete();
                }
                if(!(b2.group in b1.exclude)){
                    b2.delete();
                }
            }else{//ship on bullet
                var ship = pair[0];
                var bullet = pair[1];
                if(ship.type === "bullet"){
                    ship = pair[1];
                    bullet = pair[0];
                }
                if(!(ship.group in bullet.exclude)){
                    //then do the calculation thing
                    bullet.delete();
                    ship.health -= bullet.damage;
                    if(ship.health < 0){
                        delete enemies[ship.id];
                        if(ship === me){
                            alert("game over");
                        }
                        ship.delete();
                    }
                }
            }
        }
    }


    this.init = async function(){
        //game phase
        while(true){
            var {dt,t} = await animation.nextFrame();
            this.step(dt/1000,t);
            this.render();
        }

    }
};


//controls
var controls = {
    left:false,
    right:false,
    forward:false
};

document.addEventListener("keydown",function(e){
    if(e.which === 37){
        controls.left = true;
    }else if(e.which === 39){
        controls.right = true;
    }else if(e.which === 38){
        controls.forward = true;
    }
});

document.addEventListener("keyup",function(e){
    if(e.which === 37){
        controls.left = false;
    }else if(e.which === 39){
        controls.right = false;
    }else if(e.which === 38){
        controls.forward = false;
    }
});


var width = 500;
var height = 500;

var ui = BODY.add("div").e;
var canvas = BODY.add("canvas").e;
canvas.width = width;
canvas.height = height;
var ctx = canvas.getContext("2d");
ctx.x = 0;
ctx.y = 0;
ctx.a = 0;


ctx.moveTo1 = function(x,y){
    var {x1,y1} = rotate(x-ctx.x,y-ctx.y,-ctx.a);
    ctx.moveTo(x1+width/2,y1+height/2);
};
ctx.lineTo1 = function(x,y){
    var {x1,y1} = rotate(x-ctx.x,y-ctx.y,-ctx.a);
    ctx.lineTo(x1+width/2,y1+height/2);
};
ctx.arc1 = function(x,y,r,a,b){
    var {x1,y1} = rotate(x-ctx.x,y-ctx.y,-ctx.a);
    ctx.arc(x1+width/2,y1+height/2,r,a,b)
};
var game = new Game(ctx,width,height);
game.init();
