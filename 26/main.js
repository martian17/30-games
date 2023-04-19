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

var flattern = function(arr){
    var a = [];
    for(var i = 0; i < arr.length; i++){
        var aa = arr[i];
        for(var j = 0; j < aa.length; j++){
            a.push(aa[j]);
        }
    }
    return a;
};

var rotateCtx = function(ctx,angle,x,y){
    ctx.setTransform(
        Math.cos(angle),
        Math.sin(angle),
        -Math.sin(angle),
        Math.cos(angle),
        x-(x*Math.cos(angle)-y*Math.sin(angle)),
        y-(x*Math.sin(angle)+y*Math.cos(angle)));
};

var drawPiece = function(ctx,cw,piece){
    var x = piece.x;
    var y = piece.y;
    var u = cw/10*piece.size*piece.direction;
    ctx.beginPath();
    ctx.moveTo(x,y-4*u);
    ctx.lineTo(x+3*u,y-3*u);
    ctx.lineTo(x+4*u,y+4*u);
    ctx.lineTo(x-4*u,y+4*u);
    ctx.lineTo(x-3*u,y-3*u);
    ctx.closePath();
    ctx.fillStyle = "#c5904c";
    ctx.strokeStyle = "#000";//"#936227";
    ctx.fill();
    ctx.stroke();
    var ff = "27px Arial";//(u*5*piece.size)+"px Arial";
    ctx.font = ff;
    ctx.fillStyle = "#000";
    if(piece.flipped)ctx.fillStyle = "#f00";
    if(piece.direction === -1){
        ctx.translate(x-u*2.5,y+2*u);
        ctx.scale(-1,-1);
        ctx.fillText(piece.name,0,0);
        ctx.scale(-1,-1);
        ctx.translate(-x+u*2.5,-y-2*u);
    }else{
        ctx.fillText(piece.name,x-u*2.5,y+2*u);
    }
};

var Game = function(canvas,ctx,board){
    var filterMove = function(moves){
        return moves.filter((move)=>{
            var i = move[0];
            var j = move[1];
            if(i < 0 || j < 0 || i >= w || j >= h){
                return false;
            }else if(grid[i+j*w].piece && grid[i+j*w].piece.direction === that.direction){
                return false;
            }
            return true;
        });
    };

    var cellExist = function(i,j){
        return i >= 0 && j >= 0 && i < w && j < h;
    };
    var moveKernel = function(moves,i,j,ik,jk){
        console.log(i,j);
        for(var a = 0; a < w+h; a++){
            i += ik;
            j += jk;
            if(!cellExist(i,j))break;
            var cell = grid[i+j*w];
            if(cell.piece){
                moves.push([i,j]);
                break;
            }
            moves.push([i,j]);
        }
    };

    var GoldMove = function(i,j){
        var moves = [[i-1,j-that.direction],[i,j+1],[i+1,j-that.direction],[i-1,j],[i+1,j],[i,j-1]];
        return filterMove(moves);
    };
    var pieces = {
        歩:{
            //direction (i,j) is corrected dbeforehand
            moves:function(i,j){//dir is a positive or negative number
                var moves = [[i,j-that.direction]];
                return filterMove(moves);
            },
            back:"と"
        },
        香:{
            moves:function(i,j){
                var moves = [];
                moveKernel(moves,i,j,0,-that.direction);
                return filterMove(moves);
            },
            back:"成香"
        },
        桂:{
            moves:function(i,j){
                var moves = [[i-1,j-that.direction*2],[i+1,j-that.direction*2]];
                return filterMove(moves);
            },
            back:"成桂"
        },
        銀:{
            moves:function(i,j){
                var moves = [[i-1,j+1],[i,j-that.direction],[i+1,j+1],[i-1,j-1],[i+1,j-1]];
                return filterMove(moves);
            },
            back:"成銀"
        },
        飛:{
            moves:function(i,j){
                var moves = [];
                moveKernel(moves,i,j,-1,0);
                moveKernel(moves,i,j,1,0);
                moveKernel(moves,i,j,0,-1);
                moveKernel(moves,i,j,0,1);
                return filterMove(moves);
            },
            back:"竜"
        },
        角:{
            moves:function(i,j){
                var moves = [];
                moveKernel(moves,i,j,1,1);
                moveKernel(moves,i,j,1,-1);
                moveKernel(moves,i,j,-1,1);
                moveKernel(moves,i,j,-1,-1);
                return filterMove(moves);
            },
            back:"馬"
        },
        金:{
            moves:GoldMove,
            back:false
        },
        玉:{
            moves:function(i,j){
                var moves = [[i-1,j+1],[i,j+1],[i+1,j+1],[i-1,j],[i+1,j],[i-1,j-1],[i,j-1],[i+1,j-1]];
                return filterMove(moves);
            },
            back:false
        },
        //back sides
        と:{
            moves:GoldMove,
            back:false
        },
        成香:{
            moves:GoldMove,
            back:false,
            label:"香"
        },
        成桂:{
            moves:GoldMove,
            back:false,
            label:"桂"
        },
        成銀:{
            moves:GoldMove,
            back:false,
            label:"銀"
        },
        竜:{
            moves:function(i,j){
                var moves = [[i+1,j+1],[i-1,j+1],[i+1,j-1],[i-1,j-1]];
                moveKernel(moves,i,j,-1,0);
                moveKernel(moves,i,j,1,0);
                moveKernel(moves,i,j,0,-1);
                moveKernel(moves,i,j,0,1);
                return filterMove(moves);
            },
            back:false
        },
        馬:{
            moves:function(i,j){
                var moves = [[i+1,j],[i-1,j],[i,j+1],[i,j-1]];
                moveKernel(moves,i,j,1,1);
                moveKernel(moves,i,j,1,-1);
                moveKernel(moves,i,j,-1,1);
                moveKernel(moves,i,j,-1,-1);
                return filterMove(moves);
            },
            back:false
        }
    };

    var Piece = function(name,i,j,cw,direction){
        if(name in pieces){
            var p = pieces[name];
            var piece = {
                direction,
                size:p.size||1,
                x:i*cw+cw/2,
                y:j*cw+cw/2,
                name:name,
                back:p.back,
                moves:p.moves,
                flip:function(){
                    if(this.flipped || !this.back)return false;
                    this.flipped = true;
                    var p = pieces[this.back];
                    this.moves = p.moves;
                    this.name = p.label||this.back;
                },
                flipped:false//false is the front side, true is the back side
            };
            piece.moves = p.moves;
            return piece;
        }else{
            return false;
        }
    };


    this.renderBoard = function(){
        ctx.setTransform(1,0,0,1,1,1);
        ctx.clearRect(-1,-1,width,height);
        var angle = this.angle;
        rotateCtx(ctx,this.angle,width/2,height/2);
        //rendering the board
        ctx.fillStyle = "#f8b96c";
        ctx.strokeStyle = "#000";
        ctx.fillRect(0,0,width,height);
        for(var i = 0; i < w+1; i++){
            ctx.beginPath();
            ctx.moveTo(i*cw,0);
            ctx.lineTo(i*cw,height);
            ctx.stroke();
        }
        for(var i = 0; i < h+1; i++){
            ctx.beginPath();
            ctx.moveTo(0,i*cw);
            ctx.lineTo(width,i*cw);
            ctx.stroke();
        }
        ctx.fillStyle = "#000";
        for(var i = 3; i < w; i+=3){
            for(var j = 3; j < h; j+=3){
                ctx.beginPath();
                ctx.arc(i*cw,j*cw,3,0,6.28);
                ctx.closePath();
                ctx.fill();
            }
        }
        //doing the pieces
        for(var i = 0; i < w; i++){
            for(var j = 0; j < h; j++){
                var idx = i+j*w;
                var cell = this.grid[idx];
                if(cell.piece){
                    drawPiece(ctx,cw,cell.piece);
                }
            }
        }
        //rendering the player names
        ctx.fillStyle = "#8cfff587";
        ctx.fillRect(0,height-20,100,20);
        ctx.fillRect(width-100,0,100,20);
        ctx.font = "15px Arial";
        ctx.fillStyle = "#000";
        ctx.strokeStyle = "#fff";
        ctx.fillText(this.players[1],10,height-5);
        ctx.translate(width-10,5);
        ctx.scale(-1,-1);
        ctx.fillText(this.players[-1],0,0);
        ctx.scale(-1,-1);
        ctx.translate(-width+10,-5);
        //ctx.fillText(this.players[1]);
    };

    this.displayOverlay = function(moves){
        ctx.fillStyle = "#0003";
        ctx.fillRect(0,0,width,height);
        for(var k = 0; k < moves.length; k++){
            var i = moves[k][0];
            var j = moves[k][1];
            ctx.beginPath();
            ctx.rect(i*cw,j*cw,cw,cw);
            ctx.closePath();
            ctx.fillStyle = "#00d47d66";
            ctx.fill();
        }
    };

    this.getIJ = function(x,y){
        //transform xy to match the board
        var x0 = width/2;
        var y0 = height/2;
        var dx = x-x0;
        var dy = y-y0;
        var cos = Math.cos(this.angle);
        var sin = -Math.sin(this.angle);
        var x1 = dx*cos+dy*sin+x0;
        var y1 = -dx*sin+dy*cos+y0;
        var i = Math.floor(x1/cw);
        var j = Math.floor(y1/cw);
        if(i < 0 || j < 0 || i >= w || j >= h){
            return false;
        }
        return {i,j}
    };
    var click = setPromiseEvent(canvas,"click");

    var that = this;
    var width = canvas.width;
    var height = canvas.height;
    var grid = board.split("\n").map((a)=>{
        return a.split("");
    });
    var w = grid[0].length;
    var h = grid.length;
    grid = flattern(grid);//flatterning
    this.grid = grid;
    var cw = width/w;
    for(var i = 0; i < w; i++){
        for(var j = 0; j < h; j++){
            var idx = i+j*w;
            var cell = {
                i,j,
                piece:Piece(this.grid[idx],i,j,cw,j<h/2?-1:1),
            };
            this.grid[idx] = cell;
        }
    }
    console.log(this.grid);
    this.angle = 0;
    this.direction = 1;
    this.players = {};
    this.players[1] = "Player 1";
    this.players[-1] = "Player 2";

    this.init = async function(){
        this.renderBoard();
        while(true){
            await  animation.nextFrame();
            await  animation.nextFrame();
            this.renderBoard();
            var {x,y} = await click();
            var result = this.getIJ(x,y);
            if(!result)continue;
            var {i,j} = result;
            console.log(i,j);
            if(!grid[i+j*w].piece)continue;
            if(grid[i+j*w].piece.direction !== this.direction)continue;//opponents'
            //got the ij and confirmed it has a piece
            var piece = grid[i+j*w].piece;
            //display the overlay
            var moves = piece.moves(i,j);
            console.log(moves);
            this.displayOverlay(moves);

            var i0 = i;
            var j0 = j;

            var {x,y} = await click();
            var result = this.getIJ(x,y);
            if(!result)continue;
            var {i,j} = result;
            console.log(i,j);
            var move = false;
            for(var k = 0; k < moves.length; k++){
                if(moves[k][0] === i && moves[k][1] === j){
                    move = moves[k];
                    continue;
                }
            }
            console.log(move);
            if(!move)continue;
            //if there is a piece captred
            //implement the capture mechanism later
            var piece1;
            if(grid[i+j*w].piece){
                piece1 = grid[i+j*w].piece;
            }
            if(this.direction === 1 && j <= 2 || this.direction === -1 && j >= 6){
                console.log("asdfasd");
                piece.flip();
            }
            grid[i+j*w].piece = piece;
            grid[i0+j0*w].piece = false;
            await animation.transition(500,(r)=>{
                this.renderBoard();
                var i1 = i0+(i-i0)*r;
                var j1 = j0+(j-j0)*r;
                piece.x=i1*cw+cw/2;
                piece.y=j1*cw+cw/2;
            });
            if(piece1 && piece1.name === "玉"){
                this.renderBoard();
                await animation.sleep(100);
                alert(this.players[this.direction]+" wins");
                return false;
            }
            //rotation
            var a0 = this.angle;
            await animation.transition(500,(r)=>{
                this.angle = a0+Math.PI*r;
                this.renderBoard();
            });
            this.direction = this.direction*-1;
        }
    }
};

var b =
`香桂銀金玉金銀桂香
　飛　　　　　角　
歩歩歩歩歩歩歩歩歩
　　　　　　　　　
　　　　　　　　　
　　　　　　　　　
歩歩歩歩歩歩歩歩歩
　角　　　　　飛　
香桂銀金玉金銀桂香`;

var width = 500;
var height = 500;

var canvas = BODY.add("canvas").e;
canvas.width = width;
canvas.height = height;
var ctx = canvas.getContext("2d");

var game = new Game(canvas,ctx,b);


game.init();
























