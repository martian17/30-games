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
    }
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
        bufferMS += dt;
        var itrs = Math.floor(bufferMS/that.interval);
        bufferMS -= itrs*that.interval;//goes on
        callTickets = itrs;
        if(nextFrameResolve && callTickets > 0){
            nextFrameResolve();
            nextFrameResolve = false;
            callTickets--;
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



var invaders = []

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

addInvader = function(type,i,j){
    var inv = Object.create(types[type]);
    inv.state = true;
    inv.i = i;
    inv.j = j;
    inv.x = 0;
    inv.y = 0;
    inv.alive = true;
    invaders.push(inv);
}

var invaderOrigin = {x:2,y:30};
var invaderOriginOld = {x:2,y:30};

for(var i = 0; i < 8; i++){//5 row
    var j = 4;
    addInvader("type3",i,j);
}
for(var i = 0; i < 8; i++){//4 row
    var j = 3;
    addInvader("type3",i,j);


}
for(var i = 0; i < 8; i++){//3 row
    var j = 2;
    addInvader("type2",i,j);
}
for(var i = 0; i < 8; i++){//second row
    var j = 1;
    addInvader("type2",i,j);
}
for(var i = 0; i < 8; i++){//first row
    var j = 0;
    addInvader("type1",i,j);
}


var matrixInfo = {
    invaders:[],
    add:function(type,i,j){
        var inv = Object.create(types[type]);
        inv.state = true;
        inv.i = i;
        inv.j = j;
        inv.x = 0;
        inv.y = 0;
        inv.alive = true;
        this.invaders.push(inv);
    }
};

var frame = function(){
    //matrix


    //my own


    //my bullet

    //their bullet
}

var init = async function(){
    var direction = 1;
    var downResolved = false;
    while(true){
        var downFlag = false;
        for(var i = 0; i < invaders.length; i++){
            var inv = invaders[i];
            if(!inv.alive)continue;
            await itv.waitNextFrame();
            var xx = inv.i*16;
            var yy = inv.j*10;
            inv.state = !inv.state;
            var state = inv.state;

            inv.x = invaderOrigin.x+xx;
            inv.y = invaderOrigin.y+yy;

            //checking if it hit the wall
            var xmax = invaderOrigin.x+xx+inv.w-1;
            var xmin = invaderOrigin.x+xx;
            if(width-xmax < 2){
                direction = -1;
                if(!downResolved)downFlag = true;
            }else if(xmin < 2){
                direction = 1;
                if(!downResolved)downFlag = true;
            }

            //clearing old
            for(var x = 0; x < inv.w; x++){
                for(var y = 0; y < inv.h; y++){
                    var idx = x+y*inv.w;
                    var col = inv[!state][idx];
                    if(col === 1){
                        var dataidx = ((invaderOriginOld.x+xx+x)+width*(invaderOriginOld.y+yy+y))*4
                        data[dataidx] = 0;
                        data[dataidx+1] = 0;
                        data[dataidx+2] = 0;
                        data[dataidx+3] = 255;
                    }
                }
            }
            //drawing new
            for(var x = 0; x < inv.w; x++){
                for(var y = 0; y < inv.h; y++){
                    var idx = x+y*inv.w;
                    var col = inv[state][idx];
                    if(col === 1){
                        var dataidx = ((invaderOrigin.x+xx+x)+width*(invaderOrigin.y+yy+y))*4
                        data[dataidx] = 255;
                        data[dataidx+1] = 255;
                        data[dataidx+2] = 255;
                        data[dataidx+3] = 255;
                    }
                }
            }
        }
        invaderOriginOld = JSON.parse(JSON.stringify(invaderOrigin));
        if(downFlag){
            invaderOrigin.y += 2;
            downResolved = true;
        }else{
            invaderOrigin.x += direction;
            downResolved = false;
        }
    }
}

init();