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
    var animate = function(t){
        if(start === 0) start = t;
        var dt = t - start;
        start = t;
        that.provoke("frame",{dt,t});
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
})());


var canvas = BODY.add("canvas").e;
var width = 500;
var height = 500;
canvas.width = width;
canvas.height = height;
var ctx = canvas.getContext("2d");


var dragging = false;

var createStage = function(w,h){
    //w or h larger than 2
    //random goer and attach one two to the neighbor
    var grid = [];
    var idcnt = {};
    var cnt = 0;
    var id = 0;
    var empty = function(i,j){
        if(i < 0 || i >= w || j < 0 || j >= h){
            return false;
        }
        var idx = i+j*w;
        if(grid[idx]){
            return false;
        }
        return true;
    };
    var exist = function(i,j){
        if(i < 0 || i >= w || j < 0 || j >= h){
            return false;
        }
        return true;
    }
    for(var i = 0; i < w; i++){
        for(var j = 0; j < h; j++){
            var idx = i+j*w;
            id++;
            if(!empty(i,j)){
                continue;
            }
            grid[idx] = id+"";
            idcnt[id] = 1;
            var i1 = i;
            var j1 = j;
            //random walk

            for(var k = 0; k < 5; k++){
                //choices
                var choices = [];
                if(empty(i1-1,j1))choices.push([i1-1,j1]);
                if(empty(i1+1,j1))choices.push([i1+1,j1]);
                if(empty(i1,j1-1))choices.push([i1,j1-1]);
                if(empty(i1,j1+1))choices.push([i1,j1+1]);
                if(choices.length === 0)break;
                [i1,j1] = choices[Math.floor(Math.random()*choices.length)];
                grid[i1+j1*w] = id+"";
                idcnt[id] = k+2;
            }
        }
    }
    for(var i = 0; i < w; i++){
        for(var j = 0; j < h; j++){
            var idx = i+j*w;
            if(idcnt[grid[idx]] === 1){
                var choices = [];
                if(exist(i-1,j))choices.push([i-1,j]);
                if(exist(i+1,j))choices.push([i+1,j]);
                if(exist(i,j-1))choices.push([i,j-1]);
                if(exist(i,j+1))choices.push([i,j+1]);
                var attach = choices[Math.floor(Math.random()*choices.length)];
                var idx1 = attach[0]+attach[1]*w;
                delete idcnt[grid[idx]];
                idcnt[grid[idx1]]++;
                grid[idx] = grid[idx1];
            }
        }
    }
    //now for the color
    var randomColor = function(){
        return "rgb("+Math.floor(Math.random()*256)+","+Math.floor(Math.random()*256)+","+Math.floor(Math.random()*256)+")";
    };
    //now make the shapes into shapes
    var shapes = {};
    for(var i = 0; i < w; i++){
        for(var j = 0; j < h; j++){
            var idx = i+j*w;
            var id = grid[idx];
            if(!(id in shapes)){
                shapes[id] = {
                    minx:i,
                    maxx:i,
                    miny:j,
                    maxy:j,
                };
            }
            var shape = shapes[id];
            var {minx,maxx,miny,maxy} = {...shapes[id]};
            if(i < minx){
                shape.minx = i;
            }else if(i > maxx){
                shape.maxx = i;
            }
            if(j < miny){
                shape.miny = j;
            }else if(j > maxy){
                shape.maxy = j;
            }
        }
    }
    for(var id in shapes){
        var shape = shapes[id];
        shape.id = id;
        shape.used = false;
        shape.arr = [];
        shape.color = randomColor();
        shape.w = shape.maxx-shape.minx+1;
        shape.h = shape.maxy-shape.miny+1;
        for(var i = 0; i < shape.w; i++){
            for(var j = 0; j < shape.h; j++){
                var idx0 = (i+shape.minx)+(j+shape.miny)*w;
                var idx1 = i+j*shape.w;
                if(grid[idx0] === id){
                    shape.arr[idx1] = 1;
                }else{
                    shape.arr[idx1] = 0;
                }
            }
        }
    }
    return {grid,shapes};
};


//setting up the game
var w = 4;
var h = 4;
var vw = 200;
var vh = 200;
var vx = 150;
var vy = 0;
var cw = vw/w;
var ch = vh/h;
var {grid,shapes} = {...createStage(w,h)};
var answer = grid;

var shapeList = Object.values(shapes).sort((a,b)=>(Math.random()-0.5));
var grid = [];
for(var i = 0; i < answer.length; i++){
    grid[i] = false;
}
//list (rows) of shapes down there
var nrows = Math.floor(Math.sqrt(shapeList.length)/1.4);
var rows = [];
row = {w:0,h:0,arr:[]};
var totalWidth = 0;
for(var i = 0; i < shapeList.length; i++){
    var shape = shapeList[i];
    totalWidth += shape.w+1;
}
for(var i = 0; i < shapeList.length; i++){
    var shape = shapeList[i];
    row.w += shape.w+1;
    row.h = row.h>shape.h?row.h:shape.h;
    row.arr.push(shape);
    if(row.w > totalWidth/nrows){
        row.w--;
        rows.push(row);
        row = {w:0,h:0,arr:[]};
    }
}
rows.push(row);
var listWidth = Math.max(...(rows.map(a=>a.w)));
var cw1 = width/listWidth;//cell width 1
var yoffset = 210;
for(var i = 0; i < rows.length; i++){
    var row = rows[i];
    var arr = row.arr;
    var xoffset = (listWidth - row.w)*cw1/2;
    for(var j = 0; j < arr.length; j++){
        var shape = arr[j];
        shape.x = xoffset;
        shape.y = yoffset;
        shape.cw1 = cw1;
        xoffset += shape.w*cw1+cw1;
    }
    yoffset += row.h*cw1+cw1/2;
}


var render = function(){
    ctx.clearRect(0,0,width,height);
    for(var i = 0; i < w; i++){
        for(var j = 0; j < h; j++){
            var idx = i+j*w;
            var x = vx+i*cw;
            var y = vy+j*ch;
            ctx.fillStyle = grid[idx]?shapes[grid[idx]].color:"#eee";
            ctx.fillRect(x,y,cw,ch);
        }
    }
    for(var k = 0; k < shapeList.length; k++){
        var shape = shapeList[k];
        if(shape.used)continue;
        if(shape === dragging)continue;
        ctx.fillStyle = shape.color;
        for(var i = 0; i < shape.w; i++){
            for(var j = 0; j < shape.h; j++){
                var idx = i+j*shape.w;
                if(shape.arr[idx] === 1)ctx.fillRect(shape.x+i*shape.cw1,shape.y+j*shape.cw1,shape.cw1,shape.cw1);
            }
        }
    }
    if(dragging){
        var shape = dragging;
        console.log(dragging);
        ctx.fillStyle = shape.color;
        for(var i = 0; i < shape.w; i++){
            for(var j = 0; j < shape.h; j++){
                var idx = i+j*shape.w;
                if(shape.arr[idx] === 1)ctx.fillRect(shape.dragx+i*cw-cw/2,shape.dragy+j*ch-ch/2,cw,ch);
            }
        }
    }
}

var coordEvent = function(x,y){
    console.log(x,y);
    if(y < vh){
        //in the grid
        if(x > vx && x < width-vx){
            var i = Math.floor((x-vx)/cw);
            var j = Math.floor((y-vy)/ch);
            var idx = i+j*w;
            var shape = grid[idx]?shapes[grid[idx]]:false;
            return {
                i,j,idx,shape,
                grid:true
            };
        }
    }else{
        //shape list
        for(var i = 0; i < shapeList.length; i++){
            var shape = shapeList[i];
            var x0 = shape.x;
            var y0 = shape.y;
            var x1 = x0+shape.w*shape.cw1;
            var y1 = y0+shape.h*shape.cw1;
            if(x > x0 && x < x1 && y > y0 && y < y1){
                console.log(shape);
                return {
                    shape,
                    lines:true
                }
            }
        }
    }
    return false;
};

canvas.addEventListener("mousedown",function(e){
    var x = e.clientX + scrollX - canvas.offsetLeft;
    var y = e.clientY + scrollY - canvas.offsetTop;
    var place = coordEvent(x,y);
    //if in the grid
    if(place.grid){
        if(!place.shape)return false;
        var shape = place.shape;
        dragging = shape;
        shape.holdx = place.i-shape.minx;
        shape.holdy = place.j-shape.miny;
        shape.dragx = x-shape.holdx*cw;
        shape.dragy = y-shape.holdy*ch;
        shape.used = false;
        //disabling the grid
        for(var i = 0; i < shape.w; i++){
            for(var j = 0; j < shape.h; j++){
                var idx0 = (i+shape.minx)+(j+shape.miny)*w;
                var idx1 = i+j*shape.w;
                if(shape.arr[idx1] === 1)grid[idx0] = false;
            }
        }
    }
    //if in the lines
    else if(place.lines){
        var shape = place.shape;
        if(shape.used)return false;
        dragging = shape;
        shape.holdx = Math.floor(shape.w/2);
        shape.holdy = Math.floor(shape.h/2);
        shape.dragx = x-shape.holdx*cw;
        shape.dragy = y-shape.holdy*ch;
    }
    else{
        //do nothing
    }

});

canvas.addEventListener("mousemove",function(e){
    if(dragging){
        shape = dragging;
        var x = e.clientX + scrollX - canvas.offsetLeft;
        var y = e.clientY + scrollY - canvas.offsetTop;
        shape.dragx = x-shape.holdx*cw;
        shape.dragy = y-shape.holdy*ch;
    }
});

canvas.addEventListener("mouseup",function(e){
    if(dragging){
        var shape = dragging;
        dragging = false;
        var x = e.clientX + scrollX - canvas.offsetLeft;
        var y = e.clientY + scrollY - canvas.offsetTop;
        var place = coordEvent(x,y);
        var flag = true;
        if(place.grid){
            //put the shape in place
            for(var i = 0; i < shape.w; i++){
                for(var j = 0; j < shape.h; j++){
                    var idx0 = (place.i-shape.holdx+i)+(place.j-shape.holdy+j)*w;
                    var idx1 = i+j*shape.w;
                    if(shape.arr[idx1] === 1 && (grid[idx0] || !(idx0 in grid))){//overlap!
                        flag = false;
                        break;
                    }
                }
            }
            if(flag){
                //qualified!
                for(var i = 0; i < shape.w; i++){
                    for(var j = 0; j < shape.h; j++){
                        var idx0 = (place.i-shape.holdx+i)+(place.j-shape.holdy+j)*w;
                        var idx1 = i+j*shape.w;
                        if(shape.arr[idx1] === 1){
                            console.log("fit!");
                            grid[idx0] = shape.id;
                        }
                    }
                }
                shape.used = true;
                shape.minx = place.i-shape.holdx;
                shape.miny = place.j-shape.holdy;
                shape.maxx = shape.minx+shape.w-1;
                shape.maxy = shape.miny+shape.h-1;
                return false;
            }
        }
        //if not matched
    }
});

var checkwin = function(){
    for(var i = 0; i < shapeList.length; i++){
        if(!shapeList[i].used){
            return false;
        }
    }
    return true;
}

render();


var cleared = false;
game.on("frame",function({dt,t}){
    render();
    var result = checkwin();
    if(result && !cleared){
        setTimeout(()=>{
            alert("game clear",0);
        })
        cleared = true;
    }
});