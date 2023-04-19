var HashTable = function(size){
    var table = [];//size is the size
    this.length = 0;
    //initializing it
    for(var i = 0; i < size; i++){
        table[i] = [];
    }
    this.set = function(key,value){
        this.length++;
        //key is a fp number from 0 to 1, an output from Math.random
        var idx = Math.floor(key*size);
        if(!table[idx]){
            table[idx] = [];//initialization
        }
        var bucket = table[idx];
        for(var i = 0; i < bucket.length; i+=2){
            if(bucket[i] === key){
                bucket[i+1] = value;
                return false;
            }
        }
        bucket.push(key);
        bucket.push(value);
    };
    this.get = function(key){
        var idx = Math.floor(key*size);
        var bucket = table[idx];
        for(var i = 0; i < bucket.length; i+=2){
            if(bucket[i] === key){
                return bucket[i+1];
            }
        }
        return false;
    };
    this.delete = function(key){
        this.length--;
        var idx = Math.floor(key*size);
        var bucket = table[idx];
        for(var i = 0; i < bucket.length; i+=2){
            if(bucket[i] === key){
                //found the key
                //remove the ones from here on
                bucket.splice(i,2);
                return false;
            }
        }
        return false;
    };
    this.pickRandom = function(){
        if(this.length=== 0){
            return false;//prevents infinite loop
        }
        while(true){
            var idx = Math.floor(Math.random()*size);
            var bucket = table[idx];
            if(bucket.length > 0){
                return bucket[Math.floor(bucket.length/2*Math.random())*2+1];
            }
        }
    };
};







var ease = function(x){
    //return 1 - Math.cos((x * Math.PI) / 2);
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
var interpolation = function(a0,a1,r){
    return a0+(a1-a0)*ease(r);
    //return a0+(a1-a0)*r;
};
var floor = function(n,itv){
    return Math.floor(n/itv)*itv;
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



var generateMaze = function(w,h){
    var grid = [];
    var kernel = [1,w,-1,-w];
    for(var j = 0; j < h; j++){
        for(var i = 0; i < w; i++){
            var cell = {
                edges:[false,false,false,false],
                junctions:[false,false,false,false]
            };
            grid[i+j*w] = cell;
        }
    }
    for(var j = 0; j < h-1; j++){
        for(var i = 0; i < w-1; i++){
            var cell = grid[i+j*w];
            //right
            var cell1 = grid[i+1+j*w];
            var edge = Math.random();
            cell.edges[0] = edge;
            cell1.edges[2] = edge;
            //bottom
            var cell1 = grid[i+j*w+w];
            var edge = Math.random();
            cell.edges[1] = edge;
            cell1.edges[3] = edge;
        }
    }
    //right edge
    for(var j = 0; j < h-1; j++){
        var cell = grid[w+j*w-1];
        var cell1 = grid[w+j*w-1+w];
        var edge = Math.random();
        cell.edges[1] = edge;
        cell1.edges[3] = edge;
    }
    //bottom edge
    for(var i = 0; i < w-1; i++){
        var cell = grid[w*(h-1)+i];
        var cell1 = grid[w*(h-1)+i+1];
        var edge = Math.random();
        cell.edges[0] = edge;
        cell1.edges[2] = edge;
    }
    //actually connecting it
    var esa = new HashTable(Math.floor(w*h/2));
    var idx = 0;
    var cell = grid[idx];
    var cnt = 0;
    while(true){
        cnt++;
        if(cnt>100000){
            alert("adfasdfasd");
            console.log("afasdfasdfasdfasdf");
            break;
        }
        for(var i = 0; i < cell.edges.length; i++){
            var edge = cell.edges[i];
            if(!edge)continue;
            if(esa.get(edge)){
                esa.delete(edge);
            }else{
                esa.set(edge,[idx,i]);
            }
        }

        if(esa.length === 0)break;
        var [idx0,i] = esa.pickRandom();
        idx = idx0+kernel[i];
        cell = grid[idx];

        var cell0 = grid[idx0];
        //now connect them
        cell0.junctions[i] = true;
        cell.junctions[(i+2)%4] = true;
    }
    return grid.map(a=>a.junctions);
};



/*
var Game = function(){
    var w = 150;
    var h = 150;
    var cw = 3;
    var maze = generateMaze(w,h);
    for(var i = 0; i < w; i++){
        for(var j = 0; j < h; j++){
            var idx = i+j*w;
            var cell = maze[idx];
            if(!cell[0]){//right
                ctx.beginPath();
                ctx.moveTo(10+i*cw+cw,10+j*cw);
                ctx.lineTo(10+i*cw+cw,10+j*cw+cw);
                ctx.stroke();
            }
            if(!cell[1]){//bottom
                ctx.beginPath();
                ctx.moveTo(10+i*cw+cw,10+j*cw+cw);
                ctx.lineTo(10+i*cw,10+j*cw+cw);
                ctx.stroke();
            }
            if(!cell[2]){//left
                ctx.beginPath();
                ctx.moveTo(10+i*cw,10+j*cw+cw);
                ctx.lineTo(10+i*cw,10+j*cw);
                ctx.stroke();
            }
            if(!cell[3]){//top
                ctx.beginPath();
                ctx.moveTo(10+i*cw,10+j*cw);
                ctx.lineTo(10+i*cw+cw,10+j*cw);
                ctx.stroke();
            }
        }
    }
};
*/
var Game = function(){
    this.lines = [];
    this.findLineIntersection = function(ball){
        var r = ball.r;
        var x = ball.x;
        var y = ball.y;
        var result = [];
        for(var i = 0; i < this.lines.length; i++){
            var line = this.lines[i];
            var x0 = x-line.x;
            var y0 = y-line.y;
            var a = line.w;
            var b = line.h;
            var c = Math.hypot(a,b);
            var x1 = x0*(a/c)-y0*(-b/c);
            var y1 = x0*(-b/c)+y0*(a/c);
            if(x1 > 0 && x1 < c && y1 > -r && y1 < r){
                //intersection

                //calc the ratio from start xy
                //collision point ratio
                var ratio = (x0*a+y0*b)/c/c;
                var collisionX = line.x+a*ratio;
                var collisionY = line.y+b*ratio;

                result.push({line,ratio,x:collisionX,y:collisionY});
            }else if(Math.hypot(x0,y0) < r){
                var ratio = 0;
                result.push({line,ratio,x:line.x,y:line.y});
            }else if(Math.hypot(x0-line.w,y0-line.h) < r){
                var ratio = 1;
                result.push({line,ratio,x:line.x+line.w,y:line.y+line.h});
            }
        }
        return result;
    };
    this.addLine = function(x,y,w,h){
        var line = {
            x,y,w,h,vx:0,vy:0,dadt:0
        };
        this.lines.push(line);
        return line;
    };
    this.step = function(dt){
        var vvv = 30;
        ball.vx = 0;
        if(controls.left){
            ball.vx+= -vvv;
        }
        if(controls.right){
            ball.vx+= vvv;
        }
        ball.vy = 0;
        if(controls.up){
            ball.vy+= -vvv;
        }
        if(controls.down){
            ball.vy+= vvv;
        }
        var cx = 0;
        var cy = 0;
        var fx = 0;
        var fy = 0;

        var inters = this.findLineIntersection(ball);
        for(var i = 0; i < inters.length; i++){
            //correction manuever
            var inter = inters[i];
            var line = inter.line;
            inter.ratio;
            inter.x;
            inter.y;
            var rx = ball.x - inter.x;
            var ry = ball.y - inter.y;
            var r1 = Math.hypot(rx,ry);
            cx += rx*(ball.r-r1)/ball.r;
            cy += ry*(ball.r-r1)/ball.r;

            //calculating the relative velocity of the ball to the line
            //vx vy relative
            /*var vxref = line.vx-line.dadt*line.h*inter.ratio;
            var vyref = line.vy+line.dadt*line.w*inter.ratio;
            var vxr = ball.vx-vxref;
            var vyr = ball.vy-vyref;
            var projComp = (rx*vxr+ry*vyr)/hypot2(rx,ry);
            var projx = rx*projComp;
            var projy = ry*projComp;
            var vxr1 = (vxr-2*projx*0.9);
            var vyr1 = (vyr-2*projy*0.9);
            ball.vx = vxref+vxr1;
            ball.vy = vyref+vyr1;*/
            //now reflect these
            //console.log(rx,ry,cx,cy,inter.ratio,line);
        }

        //move the ball
        ball.x += (ball.vx*dt+cx)/1;
        ball.y += (ball.vy*dt+cy)/1;
        /*ball.vy += ((g+fy/ball.m)*dt)/1;
        ball.vx += ((fx/ball.m)*dt)/1;*/
    };
    this.render = function(){
        ctx.clearRect(0,0,width,height);
        ctx.beginPath();
        ctx.arc(ball.x,ball.y,ball.r,0,6.28);
        ctx.closePath();
        ctx.fillStyle = "#000";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(goal.x,goal.y,goal.r,0,6.28);
        ctx.closePath();
        ctx.fillStyle = "#f00";
        ctx.fill();

        for(var i = 0; i < this.lines.length; i++){
            var line = this.lines[i];
            ctx.beginPath();
            ctx.moveTo(line.x,line.y);
            ctx.lineTo(line.x+line.w,line.y+line.h);
            ctx.stroke();
        }
        if(Math.hypot(goal.x-ball.x,goal.y-ball.y) < goal.r+ball.r){
            alert("game clear");
        }
    };


    var ball = {
        x:20,
        y:50,
        vx:0,
        vy:0,
        r:2,
        m:1,
    };
    var w = 60;
    var h = 60;
    var cw = 5;
    var offsetX = 70;
    var offsetY = 10;
    this.addLine(10,10,offsetX-10,0);
    this.addLine(10,10,0,h*cw);
    this.addLine(10,10+h*cw,offsetX-10,0);


    this.addLine(offsetX+cw*w,10,offsetX-10,0);
    this.addLine(offsetX+cw*w+offsetX-10,10,0,h*cw);
    this.addLine(offsetX+cw*w,10+h*cw,offsetX-10,0);

    var goal = {
        x:offsetX+cw*w+offsetX/2,
        y:10+h/2*cw,
        vx:0,
        vy:0,
        r:10,
        m:1,
    };

    var maze = generateMaze(w,h);
    for(var i = 0; i < w; i++){
        for(var j = 0; j < h; j++){
            var idx = i+j*w;
            var cell = maze[idx];
            if(!cell[0]){//right
                if(j !== Math.floor(h/2) || i !== w-1){
                    this.addLine(offsetX+i*cw+cw,offsetY+j*cw,0,cw);
                }
            }
            if(!cell[1]){//bottom
                this.addLine(offsetX+i*cw+cw,offsetY+j*cw+cw,-cw,0);
            }
            if(!cell[2]){//left
                if(j !== Math.floor(h/2) || i !== 0){
                    this.addLine(offsetX+i*cw,offsetY+j*cw+cw,0,-cw);
                }
            }
            if(!cell[3]){//top
                this.addLine(offsetX+i*cw,offsetY+j*cw,cw,0);
            }
        }
    }
}


var width = 500;
var height = 500;
/*
BODY.add("style",`
.display{
    display:inline-block;
    text-align:center;
    font-size:30px;
    padding:10px 20px;
}
`);
var display = BODY.add("div",false,"class:display").e;*/
BODY.add("br");
var canvas = BODY.add("canvas").e;
canvas.width = width;
canvas.height = height;
var ctx = canvas.getContext("2d");


var game = new Game();

animation.frame = (dt)=>{
    var aa = 10;
    for(var i = 0; i < aa; i++){
        game.step(dt/1000/aa);
    }
    game.render();
};

var controls = {
    left:false,
    right:false,
    up:false,
    down:false
};

document.addEventListener("keydown",function(e){
    if(e.which === 37){
        controls.left = true;
    }else if(e.which === 39){
        controls.right = true;
    }else if(e.which === 38){
        controls.up = true;
    }else if(e.which === 40){
        controls.down = true;
    }
});

document.addEventListener("keyup",function(e){
    if(e.which === 37){
        controls.left = false;
    }else if(e.which === 39){
        controls.right = false;
    }else if(e.which === 38){
        controls.up = false;
    }else if(e.which === 40){
        controls.down = false;
    }
});

`
─
│
┌
└
┐
┘
┴
┬
┤
├
┼

 ┌┐
─┘│


┌───┬───────┬───────┬───────────┬─────────┬───────────┬─────┬─────────┬───┐
├─┐ └─┐ ╷ ╶─┘ ╶─┐ ╷ ╵ ┌───╴ ┌───┘ ╷ ┌───┐ ├─╴ ┌─────┬─┘ ╷ ╷ └───┬─╴ ┌─┘ ╷ │
│ └─╴ │ ├─┬─────┘ │ ┌─┴─┐ ┌─┘ ┌───┘ │ ╷ ╵ │ ╶─┘ ┌─┐ ╵ ╶─┤ └───┐ ╵ ┌─┘ ┌─┤ │
│ ╶─┬─┘ ╵ │ ┌───┬─┴─┘ ╷ └─┘ ╶─┤ ┌───┤ └─┬─┤ ╶───┘ └───┬─┴───┐ └───┘ ┌─┘ │ │
├─┐ └───┐ │ ╵ ╷ │ ┌───┼───────┘ │ ┌─┴─╴ │ └─╴ ┌───┐ ┌─┘ ┌─╴ │ ╶─────┘ ╷ │ │
│ ├───┐ └─┴───┤ ╵ ╵ ┌─┘ ┌───┬───┤ ╵ ╶───┤ ┌───┘ ╷ └─┘ ┌─┤ ╶─┼───┬─────┘ │ │
│ ╵ ╷ └───┬─┐ └─────┤ ╷ │ ╷ ╵ ╷ └─────┐ └─┘ ┌─┬─┴─────┤ └─┐ │ ┌─┘ ┌─────┤ │
│ ╶─┼─┐ ╷ ╵ └───┬─╴ │ ├─┘ ├───┤ ╶───┐ └─┬───┘ ╵ ╷ ╶─┐ └─╴ │ │ ╵ ╶─┴───╴ │ │
├─┐ ╵ │ │ ┌───┐ │ ╶─┤ ╵ ╶─┤ ╷ ├───┐ ├─┐ └───────┴─┐ │ ┌───┤ │ ╶─┬───┬─╴ │ │
│ ├─╴ │ └─┘ ╷ └─┴─┐ └─────┘ │ └─┐ ╵ ╵ └───────┬─╴ │ └─┘ ╷ ╵ │ ┌─┘ ╷ │ ╶─┤ │
│ │ ┌─┴─────┴─┬─┐ └─┬───────┼─╴ ├───────┬───┬─┘ ┌─┘ ┌───┴───┴─┘ ┌─┘ ├─╴ │ │
│ ╵ │ ╶─────┐ ╵ │ ╶─┘ ┌───┐ │ ╶─┘ ┌───┐ ╵ ╷ ╵ ┌─┤ ┌─┴─╴ ┌─────┬─┤ ╶─┴───┘ │
│ ┌─┴─────┐ ├───┴───┬─┘ ╷ │ ├─────┴─╴ └─┬─┴───┘ │ ╵ ┌───┤ ╶─┐ ╵ ├───────┐ │
│ │ ╷ ┌─╴ ╵ │ ┌─╴ ┌─┘ ┌─┘ ╵ │ ╶─┬─┐ ┌───┘ ┌───┐ └───┴─╴ │ ╷ └─┐ │ ╶─┬─╴ │ │
│ │ │ └───┬─┘ │ ╷ │ ╷ ├───┐ ├─╴ ╵ │ │ ┌───┴─╴ └─┐ ╶─┐ ┌─┘ ├─┐ │ └─┐ │ ╷ │ │
│ └─┼───┐ ╵ ╶─┤ └─┤ ├─┘ ╷ └─┘ ┌───┘ │ └─┐ ╶─────┴─┐ └─┘ ┌─┘ │ │ ┌─┘ │ ├─┘ │
├─┐ ╵ ╷ └─────┼─╴ │ ╵ ┌─┴───┬─┤ ╶───┴─┐ └─────┐ ╷ ├─────┴─╴ │ │ │ ╶─┤ ╵ ┌─┤
│ └─┬─┴─────╴ │ ╶─┴─┬─┴─╴ ╷ │ └───┐ ╶─┼─────┐ └─┤ ╵ ╷ ╶─────┤ └─┴─┐ └─┬─┘ │
├─╴ │ ╶─┬─────┴─╴ ╷ ╵ ┌───┤ └─╴ ╷ └─┐ │ ╷ ╶─┴─┐ ├───┴───┐ ╷ └─┐ ╶─┴─┐ └─┐ │
│ ╶─┴─┐ ├───╴ ┌───┼───┘ ╷ └─┬─╴ ├───┘ │ └─┐ ╶─┘ │ ┌───┐ └─┼─╴ ├─┐ ╶─┴─┐ ╵ │
│ ╷ ╷ │ ╵ ┌───┤ ╷ ╵ ┌───┤ ╶─┤ ╶─┤ ╶─┬─┴─┐ ├─────┤ └─┐ └─╴ │ ╷ │ └───┐ ├─╴ │
│ │ └─┴───┘ ╶─┘ └───┴─╴ └─┐ └─╴ └─┐ ╵ ╷ ╵ └─╴ ╷ └─╴ │ ╶───┘ │ ╵ ┌─╴ │ ╵ ╶─┤
└─┴───────────────────────┴───────┴───┴───────┴─────┴───────┴───┴───┴─────┘

`