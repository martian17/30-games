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
    this.t = 0;
    var that = this;
    var animate = function(t){
        that.t = t;
        if(start === 0) start = t;
        var dt = t - start;
        start = t;
        that.provoke("frame",{dt,t});
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
})());


var randomid = function(){
    return Math.random().toString(36).slice(2);
};

var calcDist = function(v1,v2){
    return Math.hypot(v1.x-v2.x,v1.y-v2.y);
};


var sleep = function(t){
    return new Promise((resolve,reject)=>{
        setTimeout(resolve,t);
    });
};

var collide = function(a,b){
    return calcDist(a,b) < a.r+b.r;
};

var Shoot = function({ctx,width,height}){
    var lost = false;
    var score = 0;
    var enemies = {};
    var projectiles = {};
    var addProjectile = function({x,y,vx,vy,color,damage}){
        console.log("afsdfasdf");
        var id = randomid();
        var r = 5;
        projectiles[id] = {x,y,vx,vy,r,id,color,damage};
    }
    var me = {
        x:width/2,
        y:height-50,
        r:20,
        hp:10,
        period:200,
        damage:4,
        lastFired:0,
        color:"#fff",
        vx:100,
        vy:0,
        fireGun:function(t){
            if(t - this.lastFired > this.period){
                //fire the gun
                addProjectile({
                    x:this.x,
                    y:this.y-10,
                    vx:0,
                    damage:this.damage,
                    vy:-1000,
                    color:"#0ff"});
                this.lastFired = t;
            }
        }
    };
    var addEnemy = function(){
        var id = randomid();
        var x = Math.random()*width;
        var y = 0;
        var color = "#080";
        var hp = 10;
        var enemy = {
            id,x,y,color,hp,
            r:20,
            damage:30,
            vx:0,
            vy:200
        };
        enemies[id] = enemy;
        return enemy;
    };

    this.init = async function(){

        for(var i = 0; i < 10; i++){
            addEnemy();
            await sleep(1000);
        }
        await sleep(2000);
        await gameCondition();
        alert("game clear. score: "+score);
        return false;
    };
    var gameCondition = function(){
        return new Promise((resolve,reject)=>{
            if(lost){
                reject();
            }else{
                resolve();
            }
        });
    }
    var that = this;
    this.itr = function({controls,t,dt}){
        if(controls.left){
            me.x -= me.vx*dt;
        }
        if(controls.right){
            me.x += me.vx*dt;
        }
        if(me.x < 0){
            me.x = 0;
        }
        if(me.x > width){
            me.x = width;
        }
        if(controls.fire){
            me.fireGun(t);
        }
        for(var id in enemies){
            var enemy = enemies[id];
            enemy.x += enemy.vx*dt;
            enemy.y += enemy.vy*dt;
            for(var id1 in projectiles){
                var proj= projectiles[id1];
                if(collide(proj,enemy)){
                    enemy.hp -= proj.damage;
                    delete projectiles[id1];
                    if(enemy.hp<0){
                        delete enemies[id];
                        score+=100;
                    }
                }
            }
            if(collide(enemy,me)){
                me.hp -= enemy.damage;
                delete enemies[id];
                if(me.hp < 0){
                    lost = true;
                    alert("game over. score: "+score);
                    return false;
                }
            }
        }
        for(var id in projectiles){
            var enemy = projectiles[id];
            enemy.x += enemy.vx*dt;
            enemy.y += enemy.vy*dt;
        }
        that.render();
    }

    this.render = function(){
        ctx.fillStyle = "#002";
        ctx.fillRect(0,0,width,height);
        var enemy = me;
        ctx.beginPath();
        ctx.arc(enemy.x,enemy.y,enemy.r,0,6.28);
        ctx.closePath();
        ctx.fillStyle = enemy.color;
        ctx.fill();
        for(var id in enemies){
            var enemy = enemies[id];
            ctx.beginPath();
            ctx.arc(enemy.x,enemy.y,enemy.r,0,6.28);
            ctx.closePath();
            ctx.fillStyle = enemy.color;
            ctx.fill();
        }
        for(var id in projectiles){
            var enemy = projectiles[id];
            ctx.beginPath();
            ctx.arc(enemy.x,enemy.y,enemy.r,0,6.28);
            ctx.closePath();
            ctx.fillStyle = enemy.color;
            ctx.fill();
        }
    }
};


var canvas = BODY.add("canvas").e;
var width = 300;
var height = 500;
canvas.width = width;
canvas.height = height;
var ctx = canvas.getContext("2d");

var shoot = new Shoot({ctx,width,height});

shoot.init();

var controls = {
    left:false,
    right:false,
    fire:true
};
document.addEventListener("keydown", function(e) {
    if(e.keyCode === 37){//w up
        controls.left = true;
    }else if(e.keyCode === 39){
        controls.right = true;
    }else if(e.keyCode === 40){
    }else if(e.keyCode === 38){
        controls.fire = true;
    }
});
document.addEventListener("keyup", function(e) {
    if(e.keyCode === 37){//w up
        controls.left = false;
    }else if(e.keyCode === 39){
        controls.right = false;
    }else if(e.keyCode === 40){
    }else if(e.keyCode === 38){
        controls.fire = true;
    }
});

game.on("frame",({dt,t})=>{
    dt = dt/1000;
    shoot.itr({controls,t,dt});
    shoot.render();
});
