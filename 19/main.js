var ease = function(x){
    //return 1 - Math.cos((x * Math.PI) / 2);
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
var interpolation = function(a0,a1,r){
    return a0+(a1-a0)*ease(r);
    //return a0+(a1-a0)*r;
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
    this.frame = function(){};
    var that = this;
    var start = 0;
    var animate = function(t){
        if(start === 0)start = t;
        var dt = t - start;
        start = t;
        for(var i = 0; i < resolveFrame.length; i++){
            resolveFrame[i](dt);
        }
        resolveFrame = [];
        that.frame(dt);
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
})();

var Game = function(w,h,arr,animation){
    var grid = [];
    var cw = width/w;
    for(var i = 0; i < w; i++){
        for(var j = 0; j < h; j++){
            var idx = i+j*w;
            var box = false;
            if(!arr[idx]){
                //do nothing box will be empty
            }else{
                var x = i*cw;
                var y = j*cw;
                var x0,y0,x1,y1;
                var color = arr[idx];
                box = {
                    color,x,y,x0,y0,x1,y1,idx
                };
            }
            var cell = {
                i,j,box
            };
            grid[idx] = cell;
        }
    }
    this.moveLeft = async function(i0,j0){
        //console.log(i0,j0);
        var flag = false;
        var i1;
        for(var i = i0; i >= 0; i--){
            var idx = i+j0*w;
            var cell = grid[idx];
            //console.log(idx,cell);
            if(!cell.box){
                flag = true;
                i1 = i;
                break;
            }
        }
        //console.log(flag);
        if(!flag || i1 === i0){
            return false;
        }
        var boxes = [];
        for(var i = i1; i < i0; i++){
            //minus one the i
            var idx0 = i+1+j0*w;
            var idx1 = i+j0*w;
            var box = grid[idx0].box;
            grid[idx1].box = box;
            box.x0 = (i+1)*cw;
            box.x1 = i*cw;
            boxes.push(box);
        }
        grid[i0+j0*w].box = false;
        await animation.transition(100,(r)=>{
            for(var i = 0; i < boxes.length; i++){
                var box = boxes[i];
                box.x = interpolation(box.x0,box.x1,r);
            }
        });
        return true;
        //console.log(grid);
    };
    this.moveRight = async function(i0,j0){
        //console.log(i0,j0);
        var flag = false;
        var i1;
        for(var i = i0; i < w; i++){
            var idx = i+j0*w;
            var cell = grid[idx];
            //console.log(idx,cell);
            if(!cell.box){
                flag = true;
                i1 = i;
                break;
            }
        }
        //console.log(flag);
        if(!flag || i1 === i0){
            return false;
        }
        var boxes = [];
        for(var i = i1; i > i0; i--){
            //minus one the i
            var idx0 = i-1+j0*w;
            var idx1 = i+j0*w;
            var box = grid[idx0].box;
            grid[idx1].box = box;
            box.x0 = (i-1)*cw;
            box.x1 = i*cw;
            boxes.push(box);
        }
        grid[i0+j0*w].box = false;
        await animation.transition(100,(r)=>{
            for(var i = 0; i < boxes.length; i++){
                var box = boxes[i];
                box.x = interpolation(box.x0,box.x1,r);
            }
        });
        //console.log(grid);
        return true;
    };
    this.moveUp = async function(i0,j0){
        //console.log(i0,j0);
        var flag = false;
        var j1;
        for(var j = j0; j >= 0; j--){
            var idx = i0+j*w;
            var cell = grid[idx];
            //console.log(idx,cell);
            if(!cell.box){
                flag = true;
                j1 = j;
                break;
            }
        }
        //console.log(flag);
        if(!flag || j1 === j0){
            return false;
        }
        var boxes = [];
        for(var j = j1; j < j0; j++){
            //minus one the i
            var idx0 = i0+(j+1)*w;
            var idx1 = i0+j*w;
            var box = grid[idx0].box;
            grid[idx1].box = box;
            box.y0 = (j+1)*cw;
            box.y1 = j*cw;
            boxes.push(box);
        }
        grid[i0+j0*w].box = false;
        await animation.transition(100,(r)=>{
            for(var i = 0; i < boxes.length; i++){
                var box = boxes[i];
                box.y = interpolation(box.y0,box.y1,r);
            }
        });
        //console.log(grid);
        return true;
    };
    this.moveDown = async function(i0,j0){
        //console.log(i0,j0);
        var flag = false;
        var j1;
        for(var j = j0; j < h; j++){
            var idx = i0+j*w;
            var cell = grid[idx];
            //console.log(idx,cell);
            if(!cell.box){
                flag = true;
                j1 = j;
                break;
            }
        }
        //console.log(flag);
        if(!flag || j1 === j0){
            return false;
        }
        var boxes = [];
        for(var j = j1; j > j0; j--){
            //minus one the i
            var idx0 = i0+(j-1)*w;
            var idx1 = i0+j*w;
            var box = grid[idx0].box;
            grid[idx1].box = box;
            box.y0 = (j-1)*cw;
            box.y1 = j*cw;
            boxes.push(box);
        }
        grid[i0+j0*w].box = false;
        await animation.transition(100,(r)=>{
            for(var i = 0; i < boxes.length; i++){
                var box = boxes[i];
                box.y = interpolation(box.y0,box.y1,r);
            }
        });
        //console.log(grid);
        return true;
    };
    this.render = function(){
        //drawing the grid
        ctx.clearRect(0,0,width,height);
        for(var i = 0; i < grid.length; i++){
            var box = grid[i].box;
            if(!box){
                continue;
            }
            ctx.fillStyle = box.color;
            ctx.fillRect(box.x,box.y,cw,cw);
        }
    };

    var DP = {i,j};
    this.mouseDown = function(x,y){
        DP.i = Math.floor(x/cw);
        DP.j = Math.floor(y/cw);
    };
    this.mouseMove = function(x,y){
        //DP.i = Math.floor(x/cw);
        //DP.j = Math.floor(y/cw);
    };
    this.mouseUp = async function(x,y){
        var i = Math.floor(x/cw);
        var j = Math.floor(y/cw);
        var di = i-DP.i;
        var dj = j-DP.j;
        if(di*dj === 0){
            if(di === -1){
                await this.moveLeft(DP.i,DP.j);
            }else if(di === 1){
                await this.moveRight(DP.i,DP.j);
            }else if(dj === -1){
                await this.moveUp(DP.i,DP.j);
            }else if(dj === 1){
                await this.moveDown(DP.i,DP.j);
            }
        }
        //check if it's completed
        var flag = true;
        for(var i = 0; i < grid.length; i++){
            var cell = grid[i];
            if(!cell.box){
                //do nothing
            }else{
                var box = cell.box;
                if(box.idx !== i){
                    flag = false;
                }
            }
        }
        if(flag){
            await animation.sleep(100);
            alert("game clear");
        }
    };
    var inited = false;
    this.init = async function(){
        await animation.sleep(1000);
        var cnt = 0;
        while(cnt<50){
            var c = Math.random();
            var func;
            if(c < 0.25){
                func = this.moveLeft;
            }else if(c < 0.5){
                func = this.moveRight;
            }else if(c < 0.75){
                func = this.moveUp;
            }else{
                func = this.moveDown;
            }
            var result = await func(
                Math.floor(w*Math.random()),
                Math.floor(h*Math.random())
            );
            if(result){
                cnt++;
            }
        }
        inited = true;
    }
    this.init();
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


var graKernel = function(c0,c1,r){
    return "rgba("+
    Math.floor(c0[0]+r*(c1[0]-c0[0]))+","+
    Math.floor(c0[1]+r*(c1[1]-c0[1]))+","+
    Math.floor(c0[2]+r*(c1[2]-c0[2]))+","+
    Math.floor(c0[3]+r*(c1[3]-c0[3]))+")";
};

var w = 4;
var h = 3;
var arr = [];
for(var i = 0; i < w; i++){
    for(var j = 0; j < h; j++){
        var r = (j+1)/h
        var idx = i+j*w;
        arr[idx] = graKernel([255*r,255*r,0,255],[255*r,0,255*r,255],i/w);
    }
}
arr[arr.length-1] = false;
var game = new Game(w,h,arr,animation);

canvas.addEventListener("mousedown",function(e){
    var x = e.clientX + scrollX - canvas.offsetLeft;
    var y = e.clientY + scrollY - canvas.offsetTop;
    game.mouseDown(x,y);
});


canvas.addEventListener("mousemove",function(e){
    var x = e.clientX + scrollX - canvas.offsetLeft;
    var y = e.clientY + scrollY - canvas.offsetTop;
    game.mouseMove(x,y);
});

canvas.addEventListener("mouseup",function(e){
    var x = e.clientX + scrollX - canvas.offsetLeft;
    var y = e.clientY + scrollY - canvas.offsetTop;
    game.mouseUp(x,y);
});

animation.frame = function(){
    game.render();
};

game.gameClear = ()=>{
    setTimeout(()=>alert("game clear"),10);
};
game.gameOver = ()=>{
    setTimeout(()=>alert("game over"),10);
};