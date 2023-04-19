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

//a air
var stage =
`
aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
aaaaaaaaaaagaaaaaaaaaaaaaaaaaaaaagaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
aaaaaaaaaaaaagggaaaaaaaaaaaggaaaaaaaaaaaaaaggaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
ggggggaggggaaaaaaaggggaaaagggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg
`

var GameMap = function(str){
    var a0 = str.split("\n");

    var w = a0[0].length;
    var h = a0.length;

    var arr = a0.join("").split("");

    this.w = w;
    this.h = h;
    this.arr = arr;

    var character = {
        x:1/2,
        y:1/2,
        w:1/2,
        h:1,
        vx:0,
        vy:0
    };
    this.character = character;
    var entities = {};

    var vw = width*h/height;
    console.log(vw);
    var vh = h;
    var cw = height/h;

    this.render = function(){
        ctx.fillStyle = "#aaf";
        ctx.fillRect(0,0,width,height);
        var camera = {};
        if(this.character.x < vw/2){
            camera.x = 0;
        }else if(this.character.x > w - vw/2){
            camera.x = w-vw;
        }else{
            camera.x = this.character.x-vw/2;
        }
        for(var x = 0; x < w; x++){
            for(var y = 0; y < h; y++){
                var idx = x+y*w;
                if(arr[idx] === "g"){
                    ctx.fillStyle = "#0f0";
                    ctx.fillRect((x-camera.x)*cw,(y)*cw,cw,cw);
                }
            }
        }
        //rendering the character
        ctx.fillStyle = "#ffa";
        ctx.fillRect((character.x-camera.x)*cw,character.y*cw,character.w*cw,character.h*cw);
    }
    var objobjCollision = function(obj1,obj2){
        var x0a = obj1.x;
        var y0a = obj1.y;
        var x1a = obj1.x+obj.w;
        var y1a = obj1.y+obj.h;
        var x0b = obj2.x;
        var y0b = obj2.y;
        var x1b = obj2.x+obj.w;
        var y1b = obj2.y+obj.h;
        if(x0a < x1b && x1a > x0b && y0a < y1b && y1a > y0b){
            return true;
        }else{
            return false;
        }
    };

    //player
    var findCollision = function(obj){
        var boxesC = [];
        for(var x = Math.floor(obj.x); x < Math.floor(obj.x+obj.w)+1; x++){
            for(var y = Math.floor(obj.y); y < Math.floor(obj.y+obj.h)+1; y++){
                var idx = x+y*w;
                if(!arr[idx])continue;
                if(arr[idx] !== "a"){
                    //run box box collision
                    boxesC.push([x,y]);
                    //if(objboxCollision(obj,x,y)){
                    //    boxes.push(box);
                    //}
                }
            }
        }
        return boxesC;
    };
    var findEntityCollision = function(obj){
        var entitiesC = [];
        for(var key in entities){
            enriries[key];
            objobjCollision(entities[key],obj);
        }
        return entitiesC;
    }

    var collidingFace = function(x1,y1,w1,h1,x2,y2,w2,h2){
        //x1 is colliding x2
        //sort the x and y values
        var a =[x1,x1+w1,x2,x2+w2].sort();
        var b =[y1,y1+h1,y2,y2+h2].sort();
        var w = [a[2]-a[1]];
        var h = [b[2]-b[1]];
        if(w > h || (w < 0.03 && h < 0.03)){//top or bottom
            if(y1 < y2){
                return "top";//x1 is on top
            }else{
                return "bot";
            }
        }else{//left or right
            if(x1 < x2){
                return "lef";//x1 is on top
            }else{
                return "rig";
            }
        }
    }

    this.frame = function({controls,dt,t}){
        if(controls.left){
            character.x += -4*dt/1000;
        }else if(controls.right){
            character.x += 4*dt/1000;
        }
        character.x += character.vx*dt/1000;
        character.y += character.vy*dt/1000;
        //running collision check
        var blocks = findCollision(character);
        if(blocks.length > 0){
            for(var i = 0; i < blocks.length; i++){
                var block = blocks[i];
                //push the character over
                //overlap direction
                var face = collidingFace(character.x,character.y,character.w,character.h,block[0],block[1],1,1);
                console.log(face);
                if(face === "top"){
                    character.vy = 0;
                    character.jumpable = true;
                    character.y = block[1]-character.h-0.01;
                }else if(face === "bot"){
                    character.vy = 0;
                    character.y = block[1]+1+0.01;
                }else if(face === "lef"){
                    character.vx = 0;
                    character.x = block[0]-character.w-0.01;
                }else if(face === "rig"){
                    character.vx = 0;
                    character.x = block[0]+1+0.01;
                }
            }
            //character.vx = 0;
            //character.vy = 0;
        }
        if(controls.jump && character.jumpable){
            character.vy = -10;
            if(controls.left === controls.right){
                character.vx = 0;
            }else if(controls.left){
                //character.vx = -10;
            }else{
                //character.vx = 10;
            }
        }
        character.vy += 0.018*dt;
        character.jumpable = false;
        if(character.y > h){
            alert("game over");
        }
        if(character.x > w){
            alert("game clear");
        }
    };
}
var map = new GameMap(stage.slice(1,-1));

var controls = {
    left:false,
    right:false,
    jump:false
};

map.frame({controls,dt:16,t:0});
map.render();

game.on("frame",({dt,t})=>{
    map.frame({controls,dt,t});
    map.render();
});

document.addEventListener("keydown", function(e) {
    if(e.keyCode === 87){//w up
        controls.jump = true;
    }else if(e.keyCode === 65){//a left
        controls.left = true;
    }else if(e.keyCode === 68){//d right
        controls.right = true;
    }
});

document.addEventListener("keyup", function(e) {
    if(e.keyCode === 87){//w up
        controls.jump = false;
    }else if(e.keyCode === 65){//a left
        controls.left = false;
    }else if(e.keyCode === 68){//d right
        controls.right = false;
    }
});
