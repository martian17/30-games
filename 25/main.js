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

var setPromiseEvent = function(elem,name){
    var res;
    console.log(elem);
    elem.addEventListener(name,(e)=>{
        console.log("12124123");
        var result = {
            x:e.clientX-elem.offsetLeft+window.scrollX,
            y:e.clientY-elem.offsetTop+window.scrollY
        };
        if(res)res(result);//only fires once
        res = false;
    });
    return function(){
        console.log("asdfasdf");
        return new Promise((resolve,reject)=>{
            res = resolve;
        });
    };
};

var Game = function(canvas,ctx,width,height,w,h,mines=40){
    var grid = [];
    var mask = [];
    var flags = [];
    var cw = width/w;
    var flagcnt = 0;
    var remaining = w*h-mines;
    for(var i = 0; i < w; i++){
        for(var j = 0; j < h; j++){
            var idx = i+j*w;
            grid[idx] = 0;
            flags[idx] = false;
            mask[idx] = false;//unshown
        }
    }
    this.availableFlags = 0;
    var ccnntt = 0;
    while(this.availableFlags < mines){
        if(ccnntt > 10000){
            console.log("too many mines");
            return false;
        }
        ccnntt++;
        var idx = Math.floor(Math.random()*grid.length);
        if(grid[idx] === 0){
            grid[idx] = 1;
            console.log(grid[idx]);
            this.availableFlags++;
        }
    }
    var kernels = [
        [-1,-1],
        [0,-1],
        [1,-1],
        [-1,0],
        [1,0],
        [-1,1],
        [0,1],
        [1,1]
    ];
    this.cellExist = function(i,j){
        if(i < 0 || j < 0 || i >= w || j >= h){
            return false;
        }
        return true;
    };
    this.countCell = function(i,j){
        var cnt = 0;
        for(var k = 0; k < kernels.length; k++){
            var kernel = kernels[k];
            var i1 = i+kernel[0];
            var j1 = j+kernel[1];
            if(this.cellExist(i1,j1)){
                var idx1 = i1+j1*w;
                cnt+=grid[idx1];
            }
        }
        return cnt;
    };
    this.uncover = function(i,j){
        var idx = i+j*w;
        if(mask[idx]){
            return false;//dynamic wow
        }
        if(flags[idx]){
            flags[idx] = false;//remove the flag
            flagcnt --;
        }
        remaining--;
        mask[idx] = true;
        var cnt = this.countCell(i,j);
        if(cnt === 0){//try to expand it
            for(var k = 0; k < kernels.length; k++){
                var kernel = kernels[k];
                var i1 = i+kernel[0];
                var j1 = j+kernel[1];
                if(this.cellExist(i1,j1)){
                    var idx1 = i1+j1*w;
                    this.uncover(i1,j1);
                }
            }
        }else{
            //ignore it
        }
    };
    var mousedown = setPromiseEvent(canvas,"mousedown");
    this.mode = "del";//or flag
    this.init = async function(i,j){
        var {x,y} = await mousedown();
        var i = Math.floor(x/cw);
        var j = Math.floor(y/cw);
        grid[i,j] = 0;
        this.uncover(i,j);
        if(remaining === 0)setTimeout(()=>alert("game clear"),100);

        while(true){
            var {x,y} = await mousedown();
            console.log(x,y);
            var i = Math.floor(x/cw);
            var j = Math.floor(y/cw);
            var idx = i+j*w;
            if(this.mode === "del"){
                if(!mask[idx]){
                    if(grid[idx] === 0){
                        //uncover shit
                        this.uncover(i,j);
                        if(remaining === 0)setTimeout(()=>alert("game clear"),100);
                    }else{//go fucking explode
                        alert("game over");
                    }
                }else{
                    //if uncovered, do nothing
                }
            }else if(this.mode === "flag"){
                if(flags[idx]){//deflag
                    console.log("deflag");
                    this.availableFlags++;
                    flags[idx] = false;
                }else{
                    if(this.availableFlags > 0){
                        this.availableFlags--;
                        flags[idx] = true;
                    }else{
                        //do nothing
                    }
                }
            }
        }
    };
    this.render = function(){
        ctx.clearRect(0,0,width,height);
        for(var i = 0; i < w; i++){
            for(var j = 0; j < h; j++){
                var idx = i+j*w;
                if(mask[idx]){//uncovered
                    ctx.beginPath()
                    ctx.rect(i*cw,j*cw,cw,cw);
                    ctx.closePath();
                    ctx.fillStyle = "#eee";
                    ctx.strokeStyle = "#ddd";
                    ctx.fill();
                    ctx.stroke();
                    //count it up
                    var cnt = this.countCell(i,j);
                    if(cnt !== 0){//wirte the number of cells
                        ctx.fillStyle = "#000";
                        ctx.fillText(cnt,i*cw+cw/3,j*cw+cw*2/3);
                    }
                }else{//covered
                    ctx.beginPath();
                    ctx.rect(i*cw,j*cw,cw,cw);
                    ctx.closePath();
                    ctx.fillStyle = "#aaa";
                    ctx.strokeStyle = "#888";
                    ctx.fill();
                    ctx.stroke();
                    if(flags[idx] === true){
                        //deaw the flad
                        ctx.beginPath()
                        ctx.moveTo(i*cw+cw/2,j*cw+cw/6);
                        ctx.lineTo(i*cw+cw/2,j*cw+cw*5/6);
                        ctx.lineTo(i*cw+cw/2,j*cw+cw/2);
                        ctx.lineTo(i*cw+cw*3/4,j*cw+cw/3);
                        ctx.closePath();
                        ctx.fillStyle = "#f00";
                        ctx.strokeStyle = "#000";
                        ctx.stroke();
                        ctx.fill();
                    }
                }
            }
        }
    }
};


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

var game = new Game(canvas,ctx,width,height,20,20,40);

animation.frame = function(dt){
    game.render();
};

document.addEventListener("keydown",function(e){
    if(e.which === 16){
        game.mode = "flag";
    }
});

document.addEventListener("keyup",function(e){
    if(e.which === 16){
        game.mode = "del";
    }
});

game.init();

