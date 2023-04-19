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


var Drag = function(){
    this.mouseDown = mouseDown;
    var mmresolve;
    this.mouseMove = function(){
        return new Promise((resolve,reject)=>{
            mmresolve = resolve;
            mouseMove().then(resolve);
        })
    };
    mouseUp().then((xy)=>{
        this.mouseUpXy = xy;
        if(mmresolve)mmresolve({x:false,y:false});
    });
};


var Scheme = function(str){
    var rs = str.split("\n").map(a=>{
        return a.match(/.{3}/g);
    });
    var grid = [];
    var h = rs.length;
    var w = rs[0].length;
    var ts = [];
    var Ts = [];
    this.score = 0;
    for(var i = 0; i < w; i++){
        for(var j = 0; j < h; j++){
            var tile = (rs[j][i] || "   ").split("").slice(1);
            tile = {
                i,j,
                type:tile[0],
                direction:tile[1]
            };
            if(tile.direction === " ")tile = false;
            var cell = {
                i,j,tile:tile,robot:false
            };
            if(tile.type === "F"){
                this.score++;
            }
            if(tile.type === "t"){
                tile.exit = tile;
                ts.push(tile);
            }
            if(tile.type === "T"){
                tile.exit = tile;
                Ts.push(tile);
            }
            grid[i+j*w] = cell;
        }
    }
    if(!(ts.length === 0 || ts.length === 2) || !(Ts.length === 0 || Ts.length === 2)){
        console.log("error with initialization. Too many teleporters");
    }
    if(ts.length === 2){
        ts[0].exit = ts[1];
        ts[1].exit = ts[0];
    }
    if(Ts.length === 2){
        Ts[0].exit = Ts[1];
        Ts[1].exit = Ts[0];
    }
    this.grid = grid;
    this.w = w;
    this.h = h;
};

var DD = {
    l:[-1,0],
    r:[1,0],
    u:[0,-1],
    d:[0,1]
};

var dirOpposite = {
    l:"r",
    r:"l",
    u:"d",
    d:"u"
};

var getRobots = function(str){
    var rs = str.split("");
    var result = [];
    for(var k = 0; k < rs.length; k++){
        var r = {
            i:-2,j:k,
            i0:-2,j0:k,
            i00:-2,j00s:k,
            direction:rs[k]
        };
        result.push(r);
    }
    return result;
};



var Stage = function(schemex,robots,I,canvas,ctx){
    var scheme = new Scheme(schemex);
    var robots = getRobots(robots)
    var width = canvas.width;
    var height = canvas.height;
    var w = scheme.w;
    var h = scheme.h;
    var cw = width/(w+4);

    var ijToXy = function(i,j){
        var x = i*cw+2*cw;
        var y = j*cw+2*cw;
        return {x,y};
    };
    var xyToIj = function(x,y){
        var i = (x/cw)-2;
        var j = (y/cw)-2;
        return {i,j};
    };
    var u = cw/10;

    var drawTile = function(tile){
        var {x,y} = ijToXy(tile.i,tile.j);
        var shape = I[tile.type];
        ctx.fillStyle = I[tile.type][1];
        ctx.fillRect(x,y,cw,cw);
        ctx.fillStyle = I[tile.type][0];
        ctx.fillRect(x+u,y+u,u*8,u*8);
        //direction stuff
        if(tile.direction === "r" || tile.direction === "]"){
            for(var k = 2; k < shape.length; k+=2){
                var col = shape[k];
                var pol = shape[k+1];
                ctx.beginPath();
                for(var l = 0; l < pol.length; l+=2){
                    var xx = pol[l];
                    var yy = pol[l+1];
                    ctx.lineTo(x+xx*u,y+yy*u);
                }
                ctx.closePath();
                ctx.fillStyle = col;
                ctx.fill();
            }
        }else if(tile.direction === "l"){
            for(var k = 2; k < shape.length; k+=2){
                var col = shape[k];
                var pol = shape[k+1];
                ctx.beginPath();
                for(var l = 0; l < pol.length; l+=2){
                    var xx = 10-pol[l];
                    var yy = pol[l+1];
                    ctx.lineTo(x+xx*u,y+yy*u);
                }
                ctx.closePath();
                ctx.fillStyle = col;
                ctx.fill();
            }
        }else if(tile.direction === "d"){
            for(var k = 2; k < shape.length; k+=2){
                var col = shape[k];
                var pol = shape[k+1];
                ctx.beginPath();
                for(var l = 0; l < pol.length; l+=2){
                    var xx = pol[l+1];
                    var yy = pol[l];
                    ctx.lineTo(x+xx*u,y+yy*u);
                }
                ctx.closePath();
                ctx.fillStyle = col;
                ctx.fill();
            }
        }else if(tile.direction === "u"){
            for(var k = 2; k < shape.length; k+=2){
                var col = shape[k];
                var pol = shape[k+1];
                ctx.beginPath();
                for(var l = 0; l < pol.length; l+=2){
                    var xx = pol[l+1];
                    var yy = 10-pol[l];
                    ctx.lineTo(x+xx*u,y+yy*u);
                }
                ctx.closePath();
                ctx.fillStyle = col;
                ctx.fill();
            }
        }
    };
    var drawRobot = function(robot){
        var {x,y} = ijToXy(robot.i,robot.j);
        var col = "#dcd920";
        var pol = [3,2, 7,5, 3,8];
        if(robot.direction === "r"){
            ctx.beginPath();
            for(var l = 0; l < pol.length; l+=2){
                var xx = pol[l];
                var yy = pol[l+1];
                ctx.lineTo(x+xx*u,y+yy*u);
            }
            ctx.closePath();
            ctx.fillStyle = col;
            ctx.fill();
        }else if(robot.direction === "l"){
            ctx.beginPath();
            for(var l = 0; l < pol.length; l+=2){
                var xx = 10-pol[l];
                var yy = pol[l+1];
                ctx.lineTo(x+xx*u,y+yy*u);
            }
            ctx.closePath();
            ctx.fillStyle = col;
            ctx.fill();
        }else if(robot.direction === "d"){
            ctx.beginPath();
            for(var l = 0; l < pol.length; l+=2){
                var xx = pol[l+1];
                var yy = pol[l];
                ctx.lineTo(x+xx*u,y+yy*u);
            }
            ctx.closePath();
            ctx.fillStyle = col;
            ctx.fill();
        }else if(robot.direction === "u"){
            ctx.beginPath();
            for(var l = 0; l < pol.length; l+=2){
                var xx = pol[l+1];
                var yy = 10-pol[l];
                ctx.lineTo(x+xx*u,y+yy*u);
            }
            ctx.closePath();
            ctx.fillStyle = col;
            ctx.fill();
        }
    };

    this.renderScheme = function(){
        ctx.clearRect(0,0,width,height);
        var grid = scheme.grid;
        for(var i = 0; i < w; i++){
            for(var j = 0; j < h; j++){
                var cell = grid[i+j*w];
                if(!cell.tile)continue;
                var tile = cell.tile;
                drawTile(tile);
            }
        }
    };
    this.renderRobots = function(){
        for(var k = 0; k < robots.length; k++){
            var robot = robots[k];
            drawRobot(robot);
        }
    };
    this.render = function(){
        this.renderScheme();
        this.renderRobots();
    }
    this.init = async function(){
        await placeRobots()
    };
    var getRobotByIj = function(i,j){
        for(var k = 0; k < robots.length; k++){
            var robot = robots[k];
            if(robot.i < i && i < robot.i+1 && robot.j < j && j < robot.j+1){
                return robot;
            }
        }
        return false;
    };

    var getTile = function(i,j){
        if(i < 0 || j < 0 || i >= w || j >= w){
            return false;
        }
        var idx = i+j*w;
        var cell = scheme.grid[idx];
        if(!cell.tile){
            return false;
        }
        return cell.tile;
    };

    var placeable = function(i,j){
        if(i < 0 || j < 0 || i >= w || j >= w){
            return false;
        }
        var idx = i+j*w;
        var cell = scheme.grid[idx];
        if(!cell.tile){
            return false;
        }
        var tile = cell.tile;
        if(tile.type === " "){
            return true;
        }
        return false;
    };

    var that = this;

    var placeRobots = async function(){
        while(true){
            that.render();
            var drag = new Drag(canvas);
            var {x,y} = await drag.mouseDown();
            var {i,j} = xyToIj(x,y);
            var robot = getRobotByIj(i,j);
            if(!robot){
                continue;
            }
            var i0 = robot.i;
            var j0 = robot.j;
            var di = i0-i;
            var dj = j0-j;

            while(true){
                var {x,y} = await drag.mouseMove();
                if(x === false)break;//mouseup fired
                var {i,j} = xyToIj(x,y);
                robot.i = i+di;
                robot.j = j+dj;
                that.render();
            }

            var {x,y} = drag.mouseUpXy;
            var {i,j} = xyToIj(x,y);
            if(!placeable(Math.floor(i),Math.floor(j))){
                if(i < 0){
                    robot.active = false;
                    robot.i = robot.i0;
                    robot.j = robot.j0;//turn it back to initial balue
                }else{
                    robot.i = i0;
                    robot.j = j0;//turn it back to initial balue
                }
                continue;
            }
            robot.active = true;
            robot.i = Math.floor(i);
            robot.j = Math.floor(j);
        }
    };

    this.play = async function(){
        var rb = JSON.stringify(robots);
        that.render();
        var vic = false
        while(robots.map(a=>!!a.active).reduce((b,c)=>(b||c))){
            await animation.sleep(500);
            if(that.step()===true){vic=true;break;};
            that.render();
        }
        if(!vic)alert("game over");
        robots = JSON.parse(rb);
        scheme = new Scheme(schemex);
        that.render();
    };
    this.step = function(){
        for(var k = 0; k < robots.length; k++){
            var robot = robots[k];
            if(robot.active){
                var dir = DD[robot.direction];
                var i = robot.i;
                var j = robot.j;
                var i1 = i+dir[0];
                var j1 = j+dir[1];
                var tile = getTile(i1,j1);
                var tile0 = getTile(i,j);
                if(tile0.type === "P" && !tile){
                    tile0.i = i1;
                    tile0.j = j1;
                    scheme.grid[i1+j1*w].tile = tile0;
                    scheme.grid[i+j*w].tile = false;
                    robot.i = i1;
                    robot.j = j1;
                }else if(tile0.type === "J"){
                    robot.i = i1+dir[0];
                    robot.j = j1+dir[0];
                }else if(!tile){
                    robot.active = false;
                    robot.i = i1;
                    robot.j = j1;
                }
                //all the things to do
                else if(tile.type === " "){
                    robot.i = i1;
                    robot.j = j1;
                }else if(tile.type === "B"){
                    //flip all the arrows
                    for(var l = 0; l < scheme.grid.length; l++){
                        var cell = scheme.grid[l];
                        if(cell.tile && cell.tile.type === "S"){
                            cell.tile.direction = dirOpposite[cell.tile.direction];
                        }
                    }
                    robot.active = false;
                }else if(tile.type === "S"){
                    robot.i = i1;
                    robot.j = j1;
                    robot.direction = tile.direction;
                }else if(tile.type === "T"){
                    if(tile.direction === dirOpposite[robot.direction]){
                        robot.i = tile.exit.i;
                        robot.j = tile.exit.j;
                        robot.direction = tile.exit.direction;
                    }else{
                        robot.active = false;
                    }
                }else if(tile.type === "t"){
                    if(tile.direction === dirOpposite[robot.direction]){
                        robot.i = tile.exit.i;
                        robot.j = tile.exit.j;
                        robot.direction = tile.exit.direction;
                    }else{
                        robot.active = false;
                    }
                }else if(tile.type === "P"){
                    robot.i = i1;
                    robot.j = j1;
                }else if(tile.type === "J"){
                    robot.i = i1;
                    robot.j = j1;
                }else if(tile.type === "I"){//code it later perhaps idk
                    robot.i = i1;
                    robot.j = j1;
                }else if(tile.type === "b"){
                    //turn off the fire
                    //code it later
                    robot.active = false;
                }else if(tile.type === "f"){
                    //bump into it
                    robot.active = false;
                }else if(tile.type === "W"){
                    robot.i = i1;
                    robot.j = j1;
                    robot.water = true;
                    tile.type = " ";
                }else if(tile.type === "F"){
                    if(robot.water === true){
                        scheme.score--;
                        if(scheme.score === 0){
                            alert("game clear");
                            return true;
                        }
                    }
                    robot.active = false;
                }
            }
        }
    }
};


//PLRUDTtSBbFWF
`
[ ] path
[B] button
[S] spin
[T] transporter
[t] transporter 2
[P] floating pad
[J] Jump
[I] Ice
[b] button for fire
[f] fire
[W] water
[F] flower
`
var I = {};
I[" "] = [
    "#ddab59",//fill
    "#edc978",//stroke
];
I["B"] = [
    "#ddab59",//fill
    "#edc978",//stroke
    "#d83e2d",//fill col1
    [1,3, 3,1, 7,1, 9,3, 9,7, 7,9, 3,9, 1,7]
];
I["S"] = [
    "#e45b2d",//fill
    "#dbc3c0",//stroke
    "#dbc3c0",//fill col1
    [2,4, 5,4, 5,2, 8,5, 5,8, 5,6, 2,6]
];

I["T"] = [
    "#ddab59",//fill
    "#edc978",//stroke
    "#e04986",
    [5,1, 3,1, 1,3, 1,7, 3,9, 5,9]
];
I["t"] = [
    "#ddab59",//fill
    "#edc978",//stroke
    "#00c8c6",
    [5,1, 3,1, 1,3, 1,7, 3,9, 5,9]
];
I["P"] = [
    "#2ed12e",
    "#acba3c"
];
I["J"] = [//jump
    "#c3acf3",
    "#c615b0"
];
I["I"] = [
    "#fff",
    "#8cb9ce"
];
I["b"] = [
    "#edc978",
    "#ddab59",
    "#f00",//fill col1
    [4,4, 6,4, 6,6, 4,6]
];
I["f"] = [
    "#edc978",
    "#ddab59",
    "#444",//fill col1
    [4,4, 8,4, 8,6, 4,6]
];

I["W"] = [
    "#ddab59",//fill
    "#edc978",//stroke
    "#0010d3",//fill col1
    [4,4, 6,4, 6,6, 4,6]
];
I["F"] = [
    "#b64f17",
    "#54bc2e",
    "#f00",//fill col1
    [4,4, 6,4, 6,6, 4,6]
];

var canvas = document.createElement("canvas");
document.body.appendChild(canvas);
canvas.width = 500;
canvas.height = 500;
var ctx = canvas.getContext("2d");

var mouseDown = setPromiseEvent(canvas,"mousedown");
var mouseMove = setPromiseEvent(canvas,"mousemove");
var mouseUp = setPromiseEvent(canvas,"mouseup");


var stage = new Stage(
`   [Sr[ ][ ][Sd[B][ ][ ][Sd   
[Td[ ][Sr[P][P][Su[Sr[ ][ ][Sd
[W][ ]   [Td            [P][ ]
[Sr               [P][Su   [ ]
[td         [Sr[ ][Su[J]   [ ]
[ ]         [b]            [Sl
[ ]         [fr      [ ][P][ ]
[ ]   [P]   [F][W][ ][Sr   [ ]
[ ][P][Su                  [Sl
[Su[Su[ ][Su[ ][ ][ ][tl[Sr[Su`
,"rrl",I,canvas,ctx);

stage.renderScheme();
stage.renderRobots();
stage.init();

BODY.add("style",`
.button{
    background-color:#0ff;
    margin:5px;
    padding:5px 10px;
    font-size:30px;
    display:inline-block;
}
`);
var button = BODY.add("div","start!","class:button").e;
button.addEventListener("click",()=>{stage.play()});
