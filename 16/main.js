


var colors = [
    {
        hex:"#f00"
    },
    {
        hex:"#f0f"
    },
    {
        hex:"#ff0"
    },
    {
        hex:"#0ff"
    }//,
    //{
    //    hex:"#0f0"
    //}
];
var pickRandom = function(arr){
    return arr[Math.floor(Math.random()*arr.length)];
};
var findLast = function(arr){
    return arr[arr.length-1];
};
var findSecondLast = function(arr){
    return arr[arr.length-2];
};

//var ease = (t => t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t);
var ease = function(x){
    //return 1 - Math.cos((x * Math.PI) / 2);
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
var interpolation = function(a0,a1,r){
    return a0+(a1-a0)*ease(r);
    //return a0+(a1-a0)*r;
};



var Game =  function(w,h,scheme,animation){
    var grid = [];
    var that = this;
    var cw = width/w;
    this.remainingTries = 30;
    this.conquered = [];
    this.objectiveLength = 0;
    this.gameClear = ()=>{};
    this.gameOver = ()=>{};
    this.onActionCompleted = ()=>{};
    var Ball = function(i,j){
        this.color=pickRandom(colors);
        this.x=i*cw+cw/2;
        this.y=j*cw+cw/2;
        this.r=cw/3;
    }
    for(var i = 0; i < w; i++){
        for(var j = 0; j < h; j++){
            var idx = i+j*w;
            var ball = new Ball(i,j);
            var cell = {
                i:i,
                j:j,
                conquered:false,
                neighbors:[],
                ball,
                blank:false
            };
            if(scheme[idx] === 0){
                this.objectiveLength++;
            }else if(scheme[idx] === 1){
                cell.blank = true;
            }else if(scheme[idx] === 2){
                this.objectiveLength++;
                cell.conquered = true;
                this.conquered.push(cell);
            }
            grid[idx] = cell;
        }
    }
    var getCell = function(i,j){
        if(i < 0 || j < 0 || i >= w || j >= w){
            return false;
        }
        return grid[i+j*w];
    }

    //filling in the neighbors
    for(var i = 0; i < w; i++){
        for(var j = 0; j < h; j++){
            var cell = getCell(i,j);
            var kernels = [
                [0,-1],
                [0,1],
                [-1,0],
                [1,0]
            ];
            for(var k = 0; k < kernels.length; k++){
                var kernel = kernels[k];
                var cell1 = getCell(i+kernel[0],j+kernel[1]);
                if(cell1 && !cell1.blank){
                    cell.neighbors.push(cell1);
                }
            }
        }
    }

    var findCell = function(x,y){
        var i = Math.floor(x/cw);
        var j = Math.floor(y/cw);
        var idx = i+j*w;
        return grid[idx];
    };
    this.interactive = true;
    this.isMouseDown = false;
    var lineList = [];
    var squared = false;
    var mousePosition = {x:0,y:0};
    this.mouseDown = function(x,y){
        if(!this.interactive)return false;
        var cell = findCell(x,y);
        this.isMouseDown = true;
        lineList = [];
        squared = false;
        lineList.push(cell);
    };
    this.mouseMove = function(x,y){
        mousePosition.x = x;
        mousePosition.y = y;
        if(!this.interactive)return false;
        if(!this.isMouseDown)return false;
        if(lineList.length === 0)return false;
        var cell = findCell(x,y);
        var lastCell = findLast(lineList);
        var lastCell2 = findSecondLast(lineList);
        if(
            cell !== lastCell && //if not the same
            lastCell.neighbors.indexOf(cell) !== -1 &&//if adjacent
            lastCell.ball.color === cell.ball.color &&
            !squared//if not squared
        ){
            //if going back
            if(cell === lastCell2){
                lineList.pop();
            }else{
                //if squaring
                if(lineList.indexOf(cell) !== -1){//squaring!
                    squared = true;
                }
                lineList.push(cell);
            }
        }else if(//fix it
            cell !== lastCell && //if not the same
            lastCell.neighbors.indexOf(cell) !== -1 &&//if adjacent
            lastCell.ball.color === cell.ball.color
        ){
            //if going back
            if(cell === lastCell2){
                lineList.pop();
                squared = false;
            }
        }
    };
    this.deleteList = [];
    var floodFillConquer = function(cell){
        if(!cell.ball.deleting || cell.conquered){
            return false;
        }
        cell.conquered = true;
        that.conquered.push(cell);
        var neighbors = cell.neighbors;
        for(var i = 0; i < neighbors.length; i++){
            var nc1 = neighbors[i];
            floodFillConquer(nc1);
        }
    }
    this.mouseUp = async function(x,y){
        if(!this.interactive)return false;
        if(!this.isMouseDown)return false;
        this.isMouseDown = false;
        if(lineList.length === 1)return false;
        this.interactive = false;//turn it back to true when it's done
        var color = findLast(lineList).ball.color;
        this.deleteList = [];
        if(squared){
            for(var i = 0; i < grid.length; i++){
                var cell = grid[i];
                if(cell.ball.color === color){
                    cell.ball.deleting = true;
                    this.deleteList.push(cell);
                }
            }
        }else{
            for(var i = 0; i < lineList.length; i++){
                var cell = lineList[i];
                cell.ball.deleting = true;
                this.deleteList.push(cell);
            }
        }
        lineList = [];

        //determine which one will be conquered
        //flood filling the whole thing
        for(var i = 0; i < this.conquered.length; i++){
            var conq = this.conquered[i];
            var neighbors = conq.neighbors;
            for(var j = 0; j < neighbors.length; j++){
                var nc1 = neighbors[j];
                floodFillConquer(nc1);//functional
            }
        }
        var ballAnimationList = [];
        //actually deleting
        for(var i = 0; i < w; i++){
            var offset = 0;
            for(var j = h-1; j >= 0; j--){
                var cell = getCell(i,j);//findCell for coordinates
                if(cell.blank){
                    continue;
                }
                while(true){
                    var cell1 = getCell(i,j-offset);
                    if(!cell1){
                        ball = new Ball(i,j-offset);
                        break;
                    }if(cell1.ball.deleting){
                        offset++;
                    }else if(cell1.blank){
                        offset++;
                    }else{
                        ball = cell1.ball;
                        break;
                    }
                }
                cell.ball = ball;
                if(offset !== 0){
                    ball.x0 = ball.x;
                    ball.y0 = ball.y;
                    ball.x1 = i*cw+cw/2;
                    ball.y1 = j*cw+cw/2;
                    ballAnimationList.push(ball);
                }
            }
        }
        //animating the ball
        var t = 0;
        var duration = 500;
        while(t < duration){
            var dt = await animation.nextFrame();
            t += dt;
            var r = t/duration;
            for(var i = 0; i < ballAnimationList.length; i++){
                var ball = ballAnimationList[i];
                ball.y = interpolation(ball.y0,ball.y1,r);
            }
        }
        for(var i = 0; i < ballAnimationList.length; i++){
            var ball = ballAnimationList[i];
            ball.y = ball.y1;
        }
        this.interactive = true;
        this.remainingTries--;
        this.onActionCompleted();
        if(this.objectiveLength === this.conquered.length){
            this.gameClear();
            return false;
        }else if(this.remainingTries === 0){
            this.gameOver();
            return false;
        }
    };

    this.grid = grid;
    this.w = w;
    this.h = h;
    this.render = function(){
        ctx.clearRect(0,0,width,height);
        ctx.lineWidth = 2;
        //first draw the grid
        for(var i = 0; i < w; i++){
            for(var j = 0; j < h; j++){
                ctx.strokeStyle = "#aaa";
                ctx.fillStyle = "#aaa";
                ctx.beginPath();
                ctx.rect(i*cw,j*cw,cw,cw);
                var cell = getCell(i,j);
                if(cell.blank){
                    ctx.fillStyle = "#aaa";
                }else if(cell.conquered){
                    ctx.fillStyle = "#eee";
                }else{
                    ctx.fillStyle = "#ccc";
                }
                ctx.stroke();
                ctx.fill();
            }
        }
        //then draw the balls
        for(var i = 0; i < grid.length; i++){
            var cell = grid[i];
            if(cell.blank)continue;
            var ball = cell.ball;
            ctx.fillStyle = ball.color.hex;
            //console.log(ball);
            ctx.beginPath();
            ctx.arc(ball.x,ball.y,ball.r,0,6.28);
            ctx.closePath();
            ctx.fill();
        }
        //drawing the lines
        if(lineList.length > 0){
            ctx.beginPath();
            //console.log(lineList);
            var b0 = lineList[0].ball;
            ctx.strokeStyle = b0.color.hex;
            ctx.moveTo(b0.x,b0.y);
            for(var i = 0; i < lineList.length; i++){
                var ball = lineList[i].ball;
                ctx.lineTo(ball.x,ball.y);
            }
            if(this.isMouseDown)ctx.lineTo(mousePosition.x,mousePosition.y);
            ctx.lineWidth = 10;
            ctx.stroke();
        }
    }

}


var animation = new (function(){
    var resolveFrame = [];
    this.nextFrame = function(){
        return new Promise((resolve,reject)=>{
            resolveFrame.push(resolve);
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


var game = new Game(7,7,
    [
        0,0,1,1,1,0,0,
        0,0,1,1,1,0,0,
        0,0,1,1,1,0,0,
        0,0,0,0,0,0,0,
        0,1,0,0,0,1,0,
        0,1,0,2,0,1,0,
        0,1,0,0,0,1,0,
    ]
    ,animation);

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
display.innerHTML = game.remainingTries;
game.onActionCompleted = ()=>{
    display.innerHTML = game.remainingTries;
};
