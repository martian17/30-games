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

var Tetris = function({w,h,cw,ctx,width,height}){
    var grid = [];
    this.score = 0;
    var that =  this;
    for(var i = 0; i < w; i++){
        for(var j = 0; j < h; j++){
            var idx =  i+j*w;
            grid[idx] = false;//color value if filled
        }
    }
    deleteRows = async function(){
        //from bottom to up
        var cnt = 0;
        var emptied = false;
        for(var j = h-1; j >= 0; j--){
            var filled = true;
            for(var i = 0; i < w; i++){
                var idx =  i+j*w;
                if(!grid[idx]){
                    filled = false;
                    emptied = true;
                    break;
                }
            }
            if(filled){//delete everything in this row
                for(var i = 0; i < w; i++){
                    var idx =  i+j*w;
                    grid[idx] = "bamboo";
                    cnt++;
                }
            }
        };
        console.log(cnt);
        that.score += cnt*cnt;
        if(!emptied)return false;
        sleep(500);
        //then drop everything down
        while(true){
            var flag = false;
            for(var j = h-1; j > 0; j--){
                var i = 0;
                var idx =  i+j*w;
                if(grid[idx] === "bamboo"){
                    flag = true;
                    //shift everything above
                    for(var k = j; k > 0; k--){
                        for(var i = 0; i < w; i++){
                            var idx =  i+k*w;
                            var idx0 = i+(k-1)*w;
                            grid[idx] = grid[idx0];
                            grid[idx0] = false;
                        }
                    }
                }
            }
            if(!flag)break;
        }
    };
    var types = [
        {
            w:3,h:3,arr:[
                "#f00","#f00",false,
                false,"#f00",false,
                false,"#f00",false
            ],x:2,y:0
        },
        {
            w:3,h:4,arr:[
                false,"#f80",false,
                false,"#f80",false,
                false,"#f80",false,
                false,"#f80",false
            ],x:2,y:0
        },
        {
            w:3,h:3,arr:[
                "#00f",false,"#00f",
                "#00f","#00f","#00f",
                false,false,false
            ],x:2,y:0
        },
        {
            w:3,h:3,arr:[
                "#0f0","#0f0","#0f0",
                false,"#0f0",false,
                false,"#0f0",false
            ],x:2,y:0
        }
    ];
    var intersects = function(block){
        for(var i = 0; i < block.w; i++){
            for(var j = 0; j < block.h; j++){
                var blockIdx = i+j*block.w;
                if(block.arr[blockIdx]){
                    var x = i+block.x;
                    var y = j+block.y;
                    if(x < 0 || x >= w || y < 0 || y >= h){
                        console.log("alertie");
                        return true;//overflowing
                        //continue;
                    }
                    var idx1 = x+y*w;
                    if(grid[idx1]){//we got a problem
                        return true;
                    }
                }
            }
        }
        return false;
    };
    var setBlock = function(block){
        for(var i = 0; i < block.w; i++){
            for(var j = 0; j < block.h; j++){
                var blockIdx = i+j*block.w;
                if(block.arr[blockIdx]){
                    var x = i+block.x;
                    var y = j+block.y;
                    if(x < 0 || x >= w || y < 0 || y >= h){
                        continue;
                    }
                    var idx1 = x+y*w;
                    grid[idx1] = block.arr[blockIdx];
                }
            }
        }
    }
    var movingBlock;
    var step = async function(){
        if(movingBlock){
            var block = movingBlock;
            block.y += 1;
            //if block intersects
            if(intersects(block)){
                block.y -= 1;
                //set the block there
                setBlock(block);
                movingBlock = false;
                await deleteRows();
            }
        }else{
            //create a moving block
            movingBlock = JSON.parse(JSON.stringify(types[Math.floor(Math.random()*types.length)]));
            if(intersects(movingBlock)){
                setTimeout(function(){alert("game over. Score: "+that.score);},100);
                return false;
            }
            console.log(movingBlock);
        }
        await sleep(500);
        step();
    }
    this.step = step;

    this.render = function(){
        ctx.clearRect(0,0,width,height);
        for(var i = 0; i < w; i++){
            for(var j = 0; j < h; j++){
                var idx = i+j*w;
                if(grid[idx]){
                    ctx.fillStyle = grid[idx];
                    ctx.fillRect(i*cw,j*cw,cw,cw);
                }else{
                    ctx.strokeStyle = "#aaa";
                    ctx.strokeRect(i*cw,j*cw,cw,cw);
                }
            }
        }
        //rendering the moving block
        if(movingBlock){
            var block = movingBlock;
            for(var i = 0; i < block.w; i++){
                for(var j = 0; j < block.h; j++){
                    var blockIdx = i+j*block.w;
                    if(block.arr[blockIdx]){
                        var x = i+block.x;
                        var y = j+block.y;
                        if(x < 0 || x >= w || y < 0 || y >= h){
                            continue;
                        }
                        ctx.fillStyle = block.arr[blockIdx];
                        ctx.fillRect(x*cw,y*cw,cw,cw);
                    }
                }
            }
        }
        //score
        ctx.fillStyle = "#000";
        ctx.fillText("score: "+this.score,5,10);
    };
    this.moveLeft = function(){
        movingBlock.x -= 1;
        if(intersects(movingBlock)){
            movingBlock.x += 1;
        }
    };
    this.moveRight = function(){
        movingBlock.x += 1;
        if(intersects(movingBlock)){
            movingBlock.x -= 1;
        }
    };
    this.moveDown = function(){
        movingBlock.y += 1;
        if(intersects(movingBlock)){
            movingBlock.y -= 1;
        }
    };
    this.rotate = function(){
        var block = movingBlock;
        var arr1 = [];
        for(var i = 0; i < block.w; i++){
            for(var j = 0; j < block.h; j++){
                var idx = i+j*block.w;
                var idx2 = (block.h-j-1)+i*block.h;//rotate right
                arr1[idx2] = block.arr[idx];
            }
        }
        var ww = block.w;
        var hh = block.h;
        block.h = ww;
        block.w = hh;
        block.arr = arr1;
        if(intersects(block)){
            //reverse the entire operation
            var arr1 = [];
            for(var i = 0; i < block.w; i++){
                for(var j = 0; j < block.h; j++){
                    var idx = i+j*block.w;
                    var idx2 = j+(block.w-i-1)*block.h;//rotate right
                    arr1[idx2] = block.arr[idx];
                }
            }
            var ww = block.w;
            var hh = block.h;
            block.h = ww;
            block.w = hh;
            block.arr = arr1;
        }
    }
};


var canvas = BODY.add("canvas").e;
var w = 10;
var h = 20;
var cw = 20;
var width = w*cw;
var height = h*cw;
canvas.width = width;
canvas.height = height;
var ctx = canvas.getContext("2d");


var tetris = new Tetris({w,h,cw,ctx,width,height});


tetris.step();
game.on("frame",()=>{
    tetris.render();
});



document.addEventListener("keydown", function(e) {
    if(e.keyCode === 37){//w up
        tetris.moveLeft();
    }else if(e.keyCode === 39){
        tetris.moveRight();
    }else if(e.keyCode === 40){
        tetris.moveDown();
    }else if(e.keyCode === 38){
        tetris.rotate();
    }
});

