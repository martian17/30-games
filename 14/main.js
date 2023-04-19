var ConsistentInterval = function(val){
    this.interval = val;//ms
    var that = this;
    var nextFrameResolve;
    this.waitNextFrame = function(){
        return new Promise((resolve,rejec)=>{
            if(callTickets > 0){
                callTickets--;
                resolve();
            }else{//=== 0
                nextFrameResolve = resolve;
            }
        });
    };
    this.paused = false;
    this.pause = function(ms,cb){
        that.paused = true;
        console.log(ms);
        if(!cb)cb = ()=>{};
        setTimeout(()=>{
            that.paused = false;
            cb();
        },ms);
    };
    this.genericFrame = ()=>{}
    var start = 0;
    var bufferMS = 0;
    var callTickets = 0;
    var flag = false;
    var frame = async function(t){
        if(start === 0)start = t;
        var dt = t - start;
        start = t;
        that.genericFrame(dt);
        if(!that.paused){
            bufferMS += dt;
            var itrs = Math.floor(bufferMS/that.interval);
            bufferMS -= itrs*that.interval;//goes on
            callTickets = itrs;
            if(nextFrameResolve && callTickets > 0){
                nextFrameResolve();
                nextFrameResolve = false;
                callTickets--;
            }
        }
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
};

var itv = new ConsistentInterval(10);

/*var ConsistentInterval = function(func,itv){
    this.interval = 5;//ms
    var that = this;
    var start = 0;
    var bufferMS = 0;
    var flag = false;
    var frame = async function(t){
        if(start === 0)start = t;
        var dt = t - start;
        bufferMS += dt;
        var itrs = bufferMS/that.interval;
        bufferMS -= itrs*that.interval;//goes on
        flag = false;
        for(var i = 0; i < itrs; i++){
            if(frameResolve){
                frameResolve();
                frameResolve = false;
            }else{
                flag = true;
                await frameCall();

            }
            func(that.interval);
        }
        requestAnimationFrame(frame);
    }
    var frameResolve;
    var frameCallResolve;
    var frameCall = function(){
        return new Promise((resolve,reject)=>{
            frameCallResolve = resolve;
        });
    }
    var waitNextFrame = function(){
        return new Promise((resolve,reject)=>{
            if(frameCallResolve)frameCallResolve();
            frameCallResolve = false;
            if(flag){
                resolve();
            }else{
                frameResolve = resolve;
            }
        });
    }
    requestAnimationFrame(frame);
};*/




var canvas = BODY.add("canvas",false,false,`
transform: scale(2);
transform-origin: 0px 0px;
image-rendering: pixelated;
`).e;
width = 224;
height = 256;
canvas.width = width;
canvas.height = height;
var ctx = canvas.getContext("2d");
//fill it with black
ctx.fillStyle = "#000";
ctx.fillRect(0,0,width,height);
var imgdata = ctx.getImageData(0,0,width,height);
var data = imgdata.data;

itv.genericFrame = function(dt){//render and stuff
    ctx.putImageData(imgdata,0,0);
};

var randomid = function(){
    return Math.random().toString(36).slice(2);
};



var types = {
    type0:{
        w:16,
        h:7,
        true:[
            0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,
            0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,
            0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,
            0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,
            1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
            0,0,1,1,1,0,0,1,1,0,0,1,1,1,0,0,
            0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0
        ]
    },
    type1:{
        score:30,
        w:12,
        h:8,
        true:[
            0,0,0,0,0,1,1,0,0,0,0,0,
            0,0,0,0,1,1,1,1,0,0,0,0,
            0,0,0,1,1,1,1,1,1,0,0,0,
            0,0,1,1,0,1,1,0,1,1,0,0,
            0,0,1,1,1,1,1,1,1,1,0,0,
            0,0,0,1,0,1,1,0,1,0,0,0,
            0,0,1,0,0,0,0,0,0,1,0,0,
            0,0,0,1,0,0,0,0,1,0,0,0
        ],
        false:[
            0,0,0,0,0,1,1,0,0,0,0,0,
            0,0,0,0,1,1,1,1,0,0,0,0,
            0,0,0,1,1,1,1,1,1,0,0,0,
            0,0,1,1,0,1,1,0,1,1,0,0,
            0,0,1,1,1,1,1,1,1,1,0,0,
            0,0,0,0,1,0,0,1,0,0,0,0,
            0,0,0,1,0,1,1,0,1,0,0,0,
            0,0,1,0,1,0,0,1,0,1,0,0
        ]
    },
    type2:{
        score:20,
        w:12,
        h:8,
        true:[
            0,0,0,1,0,0,0,0,0,1,0,0,
            0,0,0,0,1,0,0,0,1,0,0,0,
            0,0,0,1,1,1,1,1,1,1,0,0,
            0,0,1,1,0,1,1,1,0,1,1,0,
            0,1,1,1,1,1,1,1,1,1,1,1,
            0,1,1,1,1,1,1,1,1,1,1,1,
            0,1,0,1,0,0,0,0,0,1,0,1,
            0,0,0,0,1,1,0,1,1,0,0,0
        ],
        false:[
            0,0,0,1,0,0,0,0,0,1,0,0,
            0,1,0,0,1,0,0,0,1,0,0,1,
            0,1,0,1,1,1,1,1,1,1,0,1,
            0,1,1,1,0,1,1,1,0,1,1,1,
            0,1,1,1,1,1,1,1,1,1,1,1,
            0,0,1,1,1,1,1,1,1,1,1,0,
            0,0,0,1,0,0,0,0,0,1,0,0,
            0,0,1,0,0,0,0,0,0,0,1,0
        ]
    },
    type3:{
        score:10,
        w:12,
        h:8,
        true:[
            0,0,0,0,1,1,1,1,0,0,0,0,
            0,1,1,1,1,1,1,1,1,1,1,0,
            1,1,1,1,1,1,1,1,1,1,1,1,
            1,1,1,0,0,1,1,0,0,1,1,1,
            1,1,1,1,1,1,1,1,1,1,1,1,
            0,0,1,1,1,0,0,1,1,1,0,0,
            0,1,1,0,0,1,1,0,0,1,1,0,
            0,0,1,1,0,0,0,0,1,1,0,0
        ],
        false:[
            0,0,0,0,1,1,1,1,0,0,0,0,
            0,1,1,1,1,1,1,1,1,1,1,0,
            1,1,1,1,1,1,1,1,1,1,1,1,
            1,1,1,0,0,1,1,0,0,1,1,1,
            1,1,1,1,1,1,1,1,1,1,1,1,
            0,0,0,1,1,0,0,1,1,0,0,0,
            0,0,1,1,0,1,1,0,1,1,0,0,
            1,1,0,0,0,0,0,0,0,0,1,1
        ]
    },
};

var explosion = {
    w:6,
    h:13,
    pix:[
        0,0,1,0,0,0,
        1,0,0,0,0,0,
        0,0,1,0,1,0,
        0,1,1,1,0,1,
        1,1,1,1,1,0,
        0,0,1,1,0,0,
        1,0,0,1,1,0,
        0,0,1,1,0,1,
        0,1,1,1,1,0,
        1,0,1,1,1,0,
        0,1,1,1,1,1,
        1,0,1,1,1,0,
        0,1,0,1,0,1
    ]
};
var explosion2 = {
    w:8,
    h:7,
    pix:[
        1,0,0,0,1,0,0,1,
        0,0,1,0,0,0,1,0,
        0,1,1,1,1,1,1,0,
        1,1,1,1,1,1,1,1,
        0,1,1,1,1,1,1,0,
        0,0,1,0,0,1,0,0,
        1,0,0,1,0,0,0,1
    ]
};
var explosion3 = {
    w:13,
    h:9,
    pix:[
        0,1,0,0,1,0,0,0,1,0,0,1,0,
        0,0,1,0,0,1,0,1,0,0,1,0,0,
        0,0,0,1,0,0,0,0,0,1,0,0,0,
        0,0,0,0,1,0,0,0,1,0,0,0,0,
        1,1,1,0,0,0,0,0,0,0,1,1,1,
        0,0,0,0,1,0,0,0,1,0,0,0,0,
        0,0,0,1,0,0,0,0,0,1,0,0,0,
        0,0,1,0,0,1,0,1,0,0,1,0,0,
        0,1,0,0,1,0,0,0,1,0,0,1,0
    ]
};

var bulletTypes = {
    cross:{
        w:3,
        h:7,
        stages:[
            [
                0,1,0,
                0,1,0,
                0,1,0,
                0,1,0,
                0,1,0,
                0,1,0,
                1,1,1
            ],[
                0,1,0,
                0,1,0,
                0,1,0,
                1,1,1,
                0,1,0,
                0,1,0,
                0,1,0
            ],[
                1,1,1,
                0,1,0,
                0,1,0,
                0,1,0,
                0,1,0,
                0,1,0,
                0,1,0
            ]
        ]
    },
    zigzag:{
        w:3,
        h:7,
        stages:[
            [
                1,0,0,
                0,1,0,
                0,0,1,
                0,1,0,
                1,0,0,
                0,1,0,
                0,0,1
            ],[
                0,1,0,
                0,0,1,
                0,1,0,
                1,0,0,
                0,1,0,
                0,0,1,
                0,1,0
            ],[
                0,0,1,
                0,1,0,
                1,0,0,
                0,1,0,
                0,0,1,
                0,1,0,
                1,0,0
            ],[
                0,1,0,
                1,0,0,
                0,1,0,
                0,0,1,
                0,1,0,
                1,0,0,
                0,1,0
            ]
        ]
    },
    zigzagrod:{
        w:3,
        h:7,
        stages:[
            [
                0,1,1,
                1,1,0,
                0,1,0,
                0,1,1,
                1,1,0,
                0,1,0,
                0,1,0
            ],[
                0,1,0,
                0,1,0,
                0,1,0,
                0,1,0,
                0,1,0,
                0,1,0,
                0,1,0
            ],[
                0,1,0,
                0,1,0,
                1,1,0,
                0,1,1,
                0,1,0,
                1,1,0,
                0,1,1
            ],[
                0,1,0,
                0,1,0,
                0,1,0,
                0,1,0,
                0,1,0,
                0,1,0,
                0,1,0
            ]
        ]
    }
};






var M = {
    invaders:[],//linked list
    add:function(type,i,j){
        var inv = Object.create(types[type]);
        inv.state = true;
        inv.i = i;
        inv.j = j;
        inv.x = 0;
        inv.y = 0;
        inv.alive = true;
        this.invaders.push(inv);
        this.alives++;
    },
    span:{x:16,y:10},
    origin:{x:2,y:30},
    originOld:{x:2,y:30},
    direction:1,
    downResolved:false,
    downFlag:false,
    i:0,
    alives:0,
    cw:8,
    ch:5,
};

var clearInvader = function(invader){
    for(var x = 0; x < invader.w; x++){
        for(var y = 0; y < invader.h; y++){
            var idx = x+y*invader.w;
            var col = invader[invader.state][idx];
            if(col === 1){
                var dataidx = ((invader.x+x)+width*(invader.y+y))*4;
                data[dataidx] = 0;
                data[dataidx+1] = 0;
                data[dataidx+2] = 0;
                data[dataidx+3] = 255;
            }
        }
    }
}

var me = {
    x:0,
    y:height-10,
    w:12,
    h:7,
    explodedCnt2:0,
    alive:true,
    pix:[
        0,0,0,0,0,1,1,0,0,0,0,0,
        0,0,0,0,1,1,1,1,0,0,0,0,
        0,1,1,1,1,1,1,1,1,1,1,0,
        1,1,1,1,1,1,1,1,1,1,1,1,
        1,1,1,1,1,1,1,1,1,1,1,1,
        1,1,1,1,1,1,1,1,1,1,1,1,
        1,1,1,1,1,1,1,1,1,1,1,1
    ]
};

var myBullet = {
    x:0,
    y:0,
    w:1,
    h:4,
    alive:false,
    pix:[
        1,
        1,
        1,
        1
    ]
};


var clearMyBullet = function(){
    for(var x = 0; x < myBullet.w; x++){
        for(var y = 0; y < myBullet.h; y++){
            var idx = x+y*myBullet.w;
            var col = myBullet.pix[idx];
            if(col === 1){
                var dataidx = ((myBullet.x+x)+width*(myBullet.y+y))*4;
                data[dataidx] = 0;
                data[dataidx+1] = 0;
                data[dataidx+2] = 0;
                data[dataidx+3] = 255;
            }
        }
    }
};

var drawExplosion2 = function(){
    for(var x = 0; x < explosion2.w; x++){
        for(var y = 0; y < explosion2.h; y++){
            var idx = x+y*explosion2.w;
            var col = explosion2.pix[idx];
            if(col === 1){
                var dataidx = ((myBullet.x+x-3)+width*(myBullet.y+y))*4;
                data[dataidx] = 255;
                data[dataidx+1] = 255;
                data[dataidx+2] = 255;
                data[dataidx+3] = 255;
            }
        }
    }
};

var eraceExplosion2 = function(){
    for(var x = 0; x < explosion2.w; x++){
        for(var y = 0; y < explosion2.h; y++){
            var idx = x+y*explosion2.w;
            var col = explosion2.pix[idx];
            if(col === 1){
                var dataidx = ((myBullet.x+x-3)+width*(myBullet.y+y))*4;
                data[dataidx] = 0;
                data[dataidx+1] = 0;
                data[dataidx+2] = 0;
                data[dataidx+3] = 255;
            }
        }
    }
};

var drawShape = function(xx,yy,shape){
    for(var x = 0; x < shape.w; x++){
        for(var y = 0; y < shape.h; y++){
            var idx = x+y*shape.w;
            var col = shape.pix[idx];
            if(col === 1){
                var dataidx = ((xx+x-3)+width*(yy+y))*4;
                data[dataidx] = 255;
                data[dataidx+1] = 255;
                data[dataidx+2] = 255;
                data[dataidx+3] = 255;
            }
        }
    }
};

var clearShape = function(xx,yy,shape){
    for(var x = 0; x < shape.w; x++){
        for(var y = 0; y < shape.h; y++){
            var idx = x+y*shape.w;
            var col = shape.pix[idx];
            if(col === 1){
                var dataidx = ((xx+x-3)+width*(yy+y))*4;
                data[dataidx] = 0;
                data[dataidx+1] = 0;
                data[dataidx+2] = 0;
                data[dataidx+3] = 255;
            }
        }
    }
}

var drawMyBullet = function(){
    for(var x = 0; x < myBullet.w; x++){
        for(var y = 0; y < myBullet.h; y++){
            var idx = x+y*myBullet.w;
            var col = myBullet.pix[idx];
            if(col === 1){
                var dataidx = ((myBullet.x+x)+width*(myBullet.y+y))*4;
                if(data[dataidx] === 255){//enemy hit
                    var ex = myBullet.x+x;
                    var ey = myBullet.y+y;
                    var i1 = Math.floor((ex-M.origin.x)/M.span.x);
                    var j1 = Math.floor((ey-M.origin.y)/M.span.y);
                    var idx1 = i1+(M.ch-j1-1)*M.cw;
                    if(idx1 in M.invaders){
                        var invader = M.invaders[idx1];
                        if( invader.x <= ex && invader.x+invader.w-1 >= ex &&
                            invader.y <= ey && invader.y+invader.h-1 >= ey &&
                            invader.alive
                            ){// ex ey in the bounding box of ij
                                return invader;
                        }
                    }
                    var i2 = Math.floor((ex-M.originOld.x)/M.span.x);
                    var j2 = Math.floor((ey-M.originOld.y)/M.span.y);
                    var idx2 = i2+(M.ch-j2-1)*M.cw;
                    if(idx2 in M.invaders){
                        var invader = M.invaders[idx2];
                        if( invader.x <= ex && invader.x+invader.w-1 >= ex &&
                            invader.y <= ey && invader.y+invader.h-1 >= ey &&
                            invader.alive
                            ){// ex ey in the bounding box of ij
                                return invader;
                        }
                    }
                    console.log("bunker hit, just explode");
                    return false;
                }
                data[dataidx] = 255;
                data[dataidx+1] = 255;
                data[dataidx+2] = 255;
                data[dataidx+3] = 255;
            }
        }
    }
    return false;
};

var score = 0;

var myBulletFrame = function(){
    if(myBullet.alive){
        //clearing old
        clearMyBullet();
        myBullet.y -= 2;
        if(myBullet.y < 0){
            //trigger an explosion
            myBullet.alive = false;
            myBullet.explodedCnt2 = 10;
            drawExplosion2();
            return false;
        }
        //drawing new
        var invader = drawMyBullet();
        if(invader){
            console.log(invader);
            invader.alive = false;
            score+= invader.score;
            clearInvader(invader);
            M.alives--;
            if(M.alives === 0){//temp solution
                itv.pause(10000000);
                alert("game clear, score: "+score);
            }
            clearMyBullet();
            //then draw the explosion
            myBullet.alive = false;
            drawShape(invader.x+2,invader.y,explosion3);
            itv.pause(100,()=>{
                clearShape(invader.x+2,invader.y,explosion3);
            });
            return false;
        }
    }else if(myBullet.explodedCnt2 > 0){
        myBullet.explodedCnt2--;
        if(myBullet.explodedCnt2 === 0){
            //erace the explosion
            eraceExplosion2();
        }
    }else if(controls.shoot){
        myBullet.alive = true;
        myBullet.x = me.x+Math.floor(me.w/2);
        myBullet.y = me.y-myBullet.h;
    }
};

var enemyBullet = {
    x:0,
    y:0,
    w:3,
    h:7,
    alive:false,
    stage:0,
    init:function(x,y){
        var type = bulletTypes[["cross","zigzag","zigzagrod"][Math.floor(Math.random()*3)]];
        this.stages = type.stages;
        this.stage = 0;
        this.w = type.w;
        this.h = type.h;
        this.x = x;
        this.y = y;
        this.alive = true;
    }
};

var drawEnemyBullet = function(){
    var bullet = enemyBullet;
    bullet.stage++;
    bullet.stage = bullet.stage%bullet.stages.length;
    for(var x = 0; x < bullet.w; x++){
        for(var y = 0; y < bullet.h; y++){
            var idx = x+y*bullet.w;
            var col = bullet.stages[bullet.stage][idx];
            if(col === 1){
                var dataidx = ((bullet.x+x)+width*(bullet.y+y))*4;
                if(data[dataidx] === 255){//enemy hit
                    var ex = bullet.x+x;
                    var ey = bullet.y+y;
                    bullet.alive = false;
                    //if "my" hitbox
                    if( me.x <= ex && me.x+me.w-1 >= ex &&
                        me.y <= ey && me.y+me.h-1 >= ey
                        ){// ex ey in the bounding box of ij
                            return me;
                    }
                    console.log("bunker hit");
                    return false;
                }
                data[dataidx] = 255;
                data[dataidx+1] = 255;
                data[dataidx+2] = 255;
                data[dataidx+3] = 255;
            }
        }
    }
    return false;
};

var clearEnemyBullet = function(){
    var bullet = enemyBullet;
    for(var x = 0; x < bullet.w; x++){
        for(var y = 0; y < bullet.h; y++){
            var idx = x+y*bullet.w;
            var col = bullet.stages[bullet.stage][idx];
            if(col === 1){
                var dataidx = ((bullet.x+x)+width*(bullet.y+y))*4;
                data[dataidx] = 0;
                data[dataidx+1] = 0;
                data[dataidx+2] = 0;
                data[dataidx+3] = 255;
            }
        }
    }
    return false;
}

var enemyBulletFrame = function(){
    var bullet = enemyBullet;
    if(bullet.alive){
        //clearing old
        clearEnemyBullet();
        bullet.y += 2;
        if(bullet.y > height){
            //trigger an explosion
            bullet.alive = false;
            bullet.explodedCnt2 = 10;
            drawShape(bullet.x,bullet.y-5,explosion);
            return false;
        }
        //drawing new
        var collision = drawEnemyBullet();
        if(collision === me){
            me.alive = false;
            itv.pause(10000000);
            alert("game over, score: "+score);
            return false;
        }
    }else{
        //pick a random invader, and fire from it
        //make a list of viable candidates
        var cand = [];
        for(var j = 0; j < M.ch; j++){
            for(var i = 0; i < M.cw; i++){
                var idx = i+j*M.cw;
                var invader = M.invaders[idx];
                if(invader.alive && !(i in cand)){
                    cand[i] = invader;
                }
            }
        }
        cand = cand.filter(a=>a);
        var invader;
        if(cand.length === 0){
            console.log("weird");
            return false;
        }else{
            invader = cand[Math.floor(Math.random()*cand.length)];
        }
        bullet.init(invader.x+5,invader.y+invader.h);
    }
}

var frame = function(){
    //matrix
    if(M.alives !== 0){
        var inv;
        var mi0 = M.i;
        for(var i = 0; i < M.invaders.length; i++){
            M.i = (mi0+i)%M.invaders.length;
            if(M.i === 0){
                M.originOld = JSON.parse(JSON.stringify(M.origin));
                if(M.downFlag){
                    M.origin.y += 8;
                    M.downResolved = true;
                }else{
                    M.origin.x += M.direction;
                    M.downResolved = false;
                }
                M.downFlag = false;
            }
            inv = M.invaders[M.i];
            if(inv.alive === true){
                M.i = (mi0+i+1)%M.invaders.length;
                break;
            }
        }
        //inv ready
        var xx = inv.i*M.span.x;
        var yy = inv.j*M.span.y;
        inv.state = !inv.state;
        var state = inv.state;

        //checking if it hit the wall
        var xmax = M.origin.x+xx+inv.w-1;
        var xmin = M.origin.x+xx;
        if(width-xmax < 4){
            M.direction = -1;
            if(!M.downResolved)M.downFlag = true;
        }else if(xmin < 2){
            M.direction = 1;
            if(!M.downResolved)M.downFlag = true;
        }

        //clearing old
        for(var x = 0; x < inv.w; x++){
            for(var y = 0; y < inv.h; y++){
                var idx = x+y*inv.w;
                var col = inv[!state][idx];
                if(col === 1){
                    var dataidx = ((M.originOld.x+xx+x)+width*(M.originOld.y+yy+y))*4
                    data[dataidx] = 0;
                    data[dataidx+1] = 0;
                    data[dataidx+2] = 0;
                    data[dataidx+3] = 255;
                }
            }
        }
        //drawing new
        if(inv.alive === false){
            console.log(inv);
        }
        for(var x = 0; x < inv.w; x++){
            for(var y = 0; y < inv.h; y++){
                var idx = x+y*inv.w;
                var col = inv[state][idx];
                if(col === 1){
                    var dataidx = ((M.origin.x+xx+x)+width*(M.origin.y+yy+y))*4
                    data[dataidx] = 255;
                    data[dataidx+1] = 255;
                    data[dataidx+2] = 255;
                    data[dataidx+3] = 255;
                }
            }
        }
        inv.x = M.origin.x+xx;
        inv.y = M.origin.y+yy;
    }
    //my own
    var direction = 0;
    if(controls.left)direction += -1;
    if(controls.right)direction += 1;
    if(direction !== 0){
        //clearing old
        for(var x = 0; x < me.w; x++){
            for(var y = 0; y < me.h; y++){
                var idx = x+y*me.w;
                var col = me.pix[idx];
                if(col === 1){
                    var dataidx = ((me.x+x)+width*(me.y+y))*4;
                    data[dataidx] = 0;
                    data[dataidx+1] = 0;
                    data[dataidx+2] = 0;
                    data[dataidx+3] = 255;
                }
            }
        }
        me.x += direction;
        if(me.x < 0 || me.x+me.w > width){
            me.x -= direction;
        }
        //drawing new
        for(var x = 0; x < me.w; x++){
            for(var y = 0; y < me.h; y++){
                var idx = x+y*me.w;
                var col = me.pix[idx];
                if(col === 1){
                    var dataidx = ((me.x+x)+width*(me.y+y))*4;
                    data[dataidx] = 255;
                    data[dataidx+1] = 255;
                    data[dataidx+2] = 255;
                    data[dataidx+3] = 255;
                }
            }
        }
    }

    //my bullet
    myBulletFrame();

    //their bullet
    enemyBulletFrame();
}

var init = async function(){

    for(var i = 0; i < 8; i++){//5 row
        var j = 4;
        M.add("type3",i,j);
    }
    for(var i = 0; i < 8; i++){//4 row
        var j = 3;
        M.add("type3",i,j);


    }
    for(var i = 0; i < 8; i++){//3 row
        var j = 2;
        M.add("type2",i,j);
    }
    for(var i = 0; i < 8; i++){//second row
        var j = 1;
        M.add("type2",i,j);
    }
    for(var i = 0; i < 8; i++){//first row
        var j = 0;
        M.add("type1",i,j);
    }

    while(true){
        await itv.waitNextFrame();
        frame();
    }
}


var controls = {
    left:false,
    right:false,
    shoot:false,
}
document.addEventListener("keydown",function(e){
    if(e.which === 37){//left
        controls.left = true;
    }else if(e.which === 39){//right
        controls.right = true;
    }else if(e.which === 32){
        controls.shoot = true;
    }
});

document.addEventListener("keyup",function(e){
    if(e.which === 37){//left
        controls.left = false;
    }else if(e.which === 39){//right
        controls.right = false;
    }else if(e.which === 32){
        controls.shoot = false;
    }
});

init();