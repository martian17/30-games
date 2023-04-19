var alert1 = function(msg){
    setTimeout(()=>{
        alert(msg);
    },100);
}

var Reverse = function(w,h,width,height,ctx){
    var grid = [];
    for(var i = 0; i < w; i++){
        for(var j = 0; j < h; j++){
            var idx = i+j*w;
            grid[idx] = false;
        }
    }
    var getColor = function(x,y){
        if(x < 0 || x >= w || y < 0 || y >= h){
            return false;
        }else{
            return grid[x+y*w];
        }
    };
    var setColor = function(x,y,col){
        if(x < 0 || x >= w || y < 0 || y >= h){
            return false;
        }else{
            return grid[x+y*w] = col;
        }
    };
    //initial one
    grid[Math.floor(w/2)-1+(Math.floor(h/2)-1)*w] = 1;
    grid[Math.floor(w/2)-1+1+(Math.floor(h/2)-1+1)*w] = 1;
    grid[Math.floor(w/2)-1+1+(Math.floor(h/2)-1)*w] = 0;
    grid[Math.floor(w/2)-1+(Math.floor(h/2)-1+1)*w] = 0;
    var kernel = [
        [-1,-1],
        [+0,-1],
        [+1,-1],
        [-1,+0],
        [+1,+0],
        [-1,+1],
        [+0,+1],
        [+1,+1],
    ];
    var currentColor = 1;
    this.placeStone = function(x,y){
        var col = currentColor;
        var flipping = [[x,y]];
        for(var i = 0; i < kernel.length; i++){
            var dir = kernel[i];
            var x1 = x;
            var y1 = y;
            var flippable = [];
            var flag = true;
            while(true){
                x1 += dir[0];
                y1 += dir[1];
                var col1 = getColor(x1,y1);
                if(col1 === false){
                    var flag = false;
                    break;
                }else if(col1 !== col){
                    //continue on
                    flippable.push([x1,y1]);
                }else{//same color
                    break;
                }

            }
            //if terminated prematurely
            if(!flag)continue;
            if(flippable.length === 0)continue;
            flipping = flipping.concat(flippable);
        }
        if(flipping.length <= 1){
            return false;
        }
        for(var i = 0; i < flipping.length; i++){
            setColor(flipping[i][0],flipping[i][1],col);
        }
        turnResolve();
    };
    var tally = function(arr){
        var t = {"0":0,"1":0};
        for(var i = 0; i < arr.length; i++){
            var v = arr[i]
            if(!(v in t))t[v] = 0;
            t[v]++;
        }
        return t;
    };
    var placable = function(x,y,col){
        var flipping = [[x,y]];
        for(var i = 0; i < kernel.length; i++){
            var dir = kernel[i];
            var x1 = x;
            var y1 = y;
            var flippable = [];
            var flag = true;
            while(true){
                x1 += dir[0];
                y1 += dir[1];
                var col1 = getColor(x1,y1);
                if(col1 === false){
                    var flag = false;
                    break;
                }else if(col1 !== col){
                    //continue on
                    flippable.push([x1,y1]);
                }else{//same color
                    break;
                }

            }
            //if terminated prematurely
            if(!flag)continue;
            if(flippable.length === 0)continue;
            flipping = flipping.concat(flippable);
        }
        if(flipping.length <= 1){
            return false;
        }
        return true;
    }
    var checkWin = function(){
        //check if placable
        var flag1 = false;//placable
        var flag2 = true;//no empty
        for(var i = 0; i < w; i++){
            for(var j = 0; j < h; j++){
                var idx = i+j*w;
                var c = grid[idx];
                if(c === false){
                    flag2 = false;
                    //then check
                    if(placable(i,j,currentColor)){
                        flag1 = true;
                    }
                }
            }
        }
        if(flag2){
            var t = tally(grid);
            if(t[0] < t[1]){
                alert1(colvals[1]+" wins");
            }else if(t[0] > t[1]){
                alert1(colvals[0]+" wins");
            }else{
                alert1("tie");
            }
            return true;
        }else if(!flag1){
            alert1(colvals[Math.abs(1-currentColor)]+" wins");
            return true;
        }
        return false;
    };
    var colvals = ["black","white"];
    this.init = async function(){

        for(var i = 0; i < w*h; i++){
            var t = tally(grid);
            if(checkWin()){
                return false;
            }
            await turn(currentColor);
            currentColor = Math.abs(1-currentColor);
        }
        if(checkWin()){
            return false;
        }
    };

    var turnResolve;

    var turn = function(){
        return new Promise((resolve,reject)=>{
            turnResolve = resolve;
        });
    };

    var cw = width/w;
    var r = cw/2

    var render = function(){
        ctx.clearRect(0,0,width,height);
        for(var i = 0; i < w; i++){
            for(var j = 0; j < h; j++){
                var idx = i+j*w;
                var c = grid[idx];
                ctx.strokeStyle = "#aaa";
                ctx.strokeRect(i*cw,j*cw,cw,cw);
                if(c === false){
                    continue;
                }else{
                    var col = colvals[c];
                    ctx.fillStyle = col;
                    ctx.strokeStyle = "#000";
                    ctx.beginPath();
                    ctx.arc(i*cw+r,j*cw+r,r*0.8,0,6.28);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                }
            }
        }
        ctx.fillStyle = "#000";
        ctx.fillText(colvals[currentColor]+"'s turn",10,10);
    };

    var start = 0;
    var frame = function(t){
        if(start === 0)start = t;
        var dt = t - start;
        render();
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
};

var w = 4;
var h = 4;
var width = 500;
var height = 500;
var cw = width/w;
var canvas = document.createElement("canvas");
document.body.appendChild(canvas);
canvas.width = width;
canvas.height = height;
var ctx = canvas.getContext("2d");
var reverse = new Reverse(w,h,width,height,ctx);

reverse.init();

canvas.addEventListener("click",function(e){
    var xx = e.clientX + scrollX - canvas.offsetLeft;
    var yy = e.clientY + scrollY - canvas.offsetTop;
    var x = Math.floor(xx/cw);
    var y = Math.floor(yy/cw);
    reverse.placeStone(x,y);
});