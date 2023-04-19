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

var alternate = function(arr){
    var idx = 0;
    return function(){
        var result = arr[idx];
        idx++;
        if(idx >= arr.length){
            idx = 0;
        }
        return result;
    };
};


var Game = function(canvas,ctx,width,height,ui){
    var w = 4;
    var h = 4;
    var cw = width/w;
    var grid = [];
    //initializing
    for(var i = 0; i < w*h; i++){
        grid[i] = false;
    }

    //canvas event handling
    var mousedown = setPromiseEvent(canvas,"mousedown");

    this.putAnimation = async function(i,j,color){
        var x1 = i*cw+cw/2;
        var y1 = j*cw+cw/2;
        var x0 = width/2;
        var y0 = height+200;
        await animation.transition(500,(r)=>{
            this.render();//just an overlay
            //draw circle
            ctx.beginPath();
            ctx.arc(interpolate(x0,x1,r),interpolate(y0,y1,r),cw*0.4,0,6.28);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
        });
        return true;
    };
    this.checkVictoryLine = function(start,kernel){
        var col = grid[start[0]+start[1]*w];
        if(!col)return false;
        for(var i = 0; i < w; i++){
            var col1 = grid[(start[0]+i*kernel[0])+(start[1]+i*kernel[1])*w];
            if(col1 !== col)return false;
        }
        return col;
    };

    this.checkVictory = function(){
        var checklist = [
            [[0,0],[0,1]],//vertically
            [[1,0],[0,1]],
            [[2,0],[0,1]],
            [[3,0],[0,1]],

            [[0,0],[1,0]],//horizontally
            [[0,1],[1,0]],
            [[0,2],[1,0]],
            [[0,3],[1,0]],

            [[0,0],[1,1]],//diagonal
            [[3,0],[-1,1]]
        ];
        for(var i = 0; i < checklist.length; i++){
            var result = this.checkVictoryLine(checklist[i][0],checklist[i][1]);
            if(result){
                return result;
            }
        }
    };

    this.colnames = {
        "#ff3737":"Red",
        "#3737ff":"Blue"
    };

    this.init = async function(){
        this.render();
        var colors = alternate(Object.keys(this.colnames));
        var cnt = 0;
        while(true){
            var color = colors();
            ui.innerHTML = this.colnames[color]+"'s turn'";
            var {x,y} = await mousedown();
            var i = Math.floor(x/cw);
            var j = Math.floor(y/cw);
            var col0 = grid[i+j*w];
            if(col0){//there alread exists something in the cell
                colors();//get it back to the original color
                continue;
            }
            //the we are on to business, change the color there
            //do a little animation
            await this.putAnimation(i,j,color);
            grid[i+j*w] = color;
            cnt++;
            //check for victory
            var vic = this.checkVictory();
            if(vic){
                alert(this.colnames[vic]+" wins");
                return false;
            }
            if(cnt >= w*h){
                alert("Tie!");
                return false;
            }
            await animation.sleep(50);
        }
    };
    this.grid = grid;

    this.render = function(){
        ctx.clearRect(0,0,width,height);
        //draw grid
        ctx.strokeStyle = "#aaa";
        for(var i = 0; i < w+1; i++){
            ctx.beginPath();
            ctx.moveTo(i*cw,0);
            ctx.lineTo(i*cw,height);
            ctx.stroke();
        }
        for(var j = 0; j < h+1; j++){
            ctx.beginPath();
            ctx.moveTo(0,j*cw);
            ctx.lineTo(width,j*cw);
            ctx.stroke();
        }
        //draw the circles
        for(var i = 0; i < w; i++){
            for(var j = 0; j < h; j++){
                var idx = i+j*w;
                var c = grid[idx];
                if(c){
                    //draw circle
                    ctx.beginPath();
                    ctx.arc(i*cw+cw/2,j*cw+cw/2,cw*0.4,0,6.28);
                    ctx.closePath();
                    ctx.fillStyle = c;
                    ctx.fill();
                }//else do nothing
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
var game = new Game(canvas,ctx,width,height,ui);
game.init();