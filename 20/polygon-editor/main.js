var randomid = function(){
    return Math.random().toString(36).slice(2);
};
var distless = function(x,y,r){
    var dist2 = x*x+y*y;
    var r2 = r*r;
    return dist2 < r;
};
var vectorside = function(v0,v1,x1,y1){
    var a = x1-v0.x;
    var b = y1-v0.y;
    var x = v1.x-v0.x;
    var y = v1.y-v0.y;
    return b*x-a*y < 0;//if true then right side
    //if false then left side
};

var Polygon = function(ctx){
    var verts = {};
    var edges = {};
    var faces = {};//collection of edges
    //symbols and identifiers
    const VERT = 0;
    const EDGE = 1;
    const FACE = 2;
    const AIR = 3;

    this.vertspoint = function(x,y){
        for(var id in verts){
            var vert = verts[id];
            if(distless(x-vert.x,y-vert.y)){
                //found a collision
                return vert;
            }
        }
        return false;
    };
    this.edgepoint = function(x,y){
        var r = 5;//respond to r=5px
        for(var id in edges){
            var edge = edges[id];
            var v0 = verts[edge.v0];
            var v1 = verts[edge.v1];
            var x0 = x-v0.x;
            var y0 = y-v0.y;
            var a = v1.x-v0.x;
            var b = v1.y-v0.y;
            var c = Math.hypot(a,b);
            var x1 = x0*(a/c)-y0*(-b/c);//just a rotation formula
            var y1 = x0*(-b/c)+y0*(a/c);//page xxx of the note
            if(x1 > 0 && x1 < c && y1 > -r && y1 < r){
                //calculate the corresponding point
                //x1 is basically the position out of the box
                var ratio = x1/c;
                var xevt = v0.x+a*ratio;
                var yevt = v0.y+b*ratio;
                edge.xevt = xevt;
                edge.yevt = yevt;
                edge.evtRatio = ratio;
                return edge;
            }
        }
        return false;
    };
    this.facepoint = function(x,y){
        for(var id in faces){
            var face = faces[id];
            var vs = face.verts;
            var es = face.edges;
            //common case: triangle
            if(vs.length === 3){
                //on the same side lol
                var v0 = edges[vs[0]];
                var v1 = edges[vs[1]];
                var v2 = edges[vs[2]];
                var s0 = vectorside(v0,v1,x,y);
                var s1 = vectorside(v1,v2,x,y);
                var s2 = vectorside(v2,v0,x,y);
                if(s0 === s1 && s1 === s2){
                    return face;
                }
            }else{//assume it's a complex polygon
                //wow this algorithm is blazingly fast and efficient.
                //Thank you http://alienryderflex.com/polygon/
                var cnt = 0;
                var v0 = edges[vs[vs.length-1]];//the last one
                for(var i = 0; i < vs.length; i++){
                    var v1 = edges[vs[i]];
                    if((v0.y < y && y <= v1.y || v1.y < y && y <= v0.y) && v0.x+(v1.x-v0.x)*(y-v0.y/v1.y-v0.y) < x){
                        cnt++;
                    }
                    //last line has to be this
                    v0 = v1;
                }
                if(cnt&1 === 1){
                    return face;
                }
            }
        }
        return false;
    };

    this.findTarget = function(x,y){
        //finds the event target
        //first the verts
        var vert = this.vertspoint(x,y);
        if(vert){
            return vert;
        }
        var edge = this.edgepoint(x,y);
        if(edge){
            return edge;
        }
        var face = this.facepoint(x,y);
        if(face){
            return face;
        }
        return {
            type:AIR
        };//just air
    };

    this.addVert = function(x,y){
        var id = randomid();
        var vert = {
            x,y,type:VERT,id,
            verts:{},
            edges:{},
            faces:{}
        };
        verts[id] = vert;
        return vert;
    };
    this.addEdge = function(v0,v1){//judges if face should be added here
        var id = randomid();
        var edge = {
            v0,v1,type:EDGE,id,faces:{}
        };
        edges[id] = edge;
        while(true){//extra operation for faces

        }
        return edge;
    };
    this.createEdge = function(v0,v1){
        var id = randomid();
        var edge = {
            v0,v1,type:EDGE,id,faces:{}
        };
        edges[id] = edge;
        return edge;
    }
    this.splitEdge = function(edge,r){
        var v0 = verts[edge.v0];
        var v1 = verts[edge.v1];
        var x1 = v0.x+(v1.x-v0.x)*r;
        var y1 = v0.y+(v1.y-v0.y)*r;
        //create a new vertex
        var v2 = this.addVert(x1,y1);
        //create a new edge
        var e1 = createEdge(v0,v2);
        var e2 = createEdge(v2,v1);
        //face operation
        for(var key in edge.faces){

        }
    }
    this.addFace = function(verts){
        var id = randomid();
        var face = {
            verts,id,type:FACE,color:"#0000"
        };
    };
    this.removeVert = function(id){//removes edge and connect faces as well
        var vert = verts[id];
        delete verts[id];
        if(Object.keys(vert.edges).length === Object.keys(vert.faces).length){
            //enclosed vertex
            //add up all the faces
            this.mergeFaces(vert.faces);
        }else{
            for(var id1 in vert.faces){
                this.removeFace(id1);
            }
        }
        for(var id1 in vert.edges){
            //var edge = edges[vert.edges[id1]];
            this.removeEdge(id1);
        }
    };
    this.removeFace = function(id){
        var face = faces[id];
        /******continue on from here for the love of god*******/
    }

    //adding new vertices to the polygon
    var tempvert;
    this.mouseDown = function(x,y){
        //detect edge or point that the event happens
        var target = this.findTarget(x,y);//basically create an edge
        var v0 = new Vert(x,y);
        var v1 = new Vert(v,y);
        var edge = new Edge(v0.id,v1.id);
        if(target.type === VERT){
            //connected to the vert
            var v0 = target;
            var v1 = this.addVert(x,y);
            this.addEdge(v0.id,v1.id);
        }else if(target.type === EDGE){
            //connected to the edge
            //can access the event location by edge.xevt, edge.yevt
            //split it by edge.evtRatio
            //v1 is the movable vertex
            var v0 = this.splitEdge(target,target.evtRatio);
            var v1 = this.addVert(x,y);
            this.addEdge(v0.id,v1.id);

        }else{
            //assume it's air
            //originxy
        }
    };
    this.mouseMove = function(x,y){

    };
    this.mouseUp = function(x,y){

    };

};




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
    this.t = 0;
    var that = this;
    var animate = function(t){
        that.t = t;
        if(start === 0) start = t;
        var dt = t - start;
        start = t;
        that.provoke("frame",{dt,t});
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
})());


var randomid = function(){
    return Math.random().toString(36).slice(2);
};

var calcDist = function(v1,v2){
    return Math.hypot(v1.x-v2.x,v1.y-v2.y);
};

var cnt = 0;

var nodes,edges;

var Bridge = function({ctx,width,height}){
    nodes = {};
    var addCustomNode = function(node){
        var id = randomid();
        node.id = id;
        nodes[id] = node;
        return node;
    };
    addCustomNode({x:100,y:300,r:10,edges:{},nodes:{},visible:true,color:"#f80",immobile:true});
    addCustomNode({x:900,y:300,r:10,edges:{},nodes:{},visible:true,color:"#f80",immobile:true});
    var weightball = addCustomNode({x:500,y:300,r:10,edges:{},nodes:{},visible:true,color:"#f00",immobile:false,mass:10,vx:0,vy:0});
    edges = {};
    var addNode = function({x,y}){
        var id = randomid();
        nodes[id] = {x,y,r:5,id,edges:{},nodes:{},visible:true,color:"#000",mass:1,vx:0,vy:0};
        return id;
    };
    var addEdge = function(id1,id2){
        var id = randomid();
        var v1 = nodes[id1];
        var v2 = nodes[id2];
        if(id2 in v1.nodes){
            return false;
        }
        v1.nodes[id2] = true;
        v2.nodes[id1] = true;
        var dist = calcDist(v1,v2);
        //var k = dist*10;
        var k = 1/dist*100000;
        edges[id] = {v1:id1,v2:id2,id,visible:true,color:"#000",n:dist,k};
        v1.edges[id] = true;
        v2.edges[id] = true;
        return id;
    };
    var deleteNode = function(id){
        var node = nodes[id];
        for(var id2 in node.edges){
            deleteEdge(id2);
        }
        delete nodes[id]
    };
    var deleteEdge = function(id){
        var edge = edges[id];
        var v1 = nodes[edge.v1];
        var v2 = nodes[edge.v2];
        delete v1.nodes[v2.id];
        delete v2.nodes[v1.id];
        delete v1.edges[id];
        delete v2.edges[id];
        delete edges[id];
    };
    this.render = function(){
        ctx.clearRect(0,0,width,height);
        var cnt = 0;
        for(var id in edges){
            var edge = edges[id];
            if(!edge.visible)continue;
            var v1 = nodes[edge.v1];
            var v2 = nodes[edge.v2];
            ctx.beginPath();
            ctx.moveTo(v1.x,v1.y);
            ctx.lineTo(v2.x,v2.y);
            ctx.strokeStyle = edge.color;
            ctx.stroke();
        }
        for(var id in nodes){
            var node = nodes[id];
            if(!node.visible)continue;
            ctx.beginPath();
            ctx.arc(node.x,node.y,node.r,0,6.28);
            ctx.closePath();
            ctx.strokeStyle = node.color;
            ctx.stroke();
            //ctx.fillText(node.id,node.x,node.y);
        }
    };
    var findNode = function(x,y){
        for(var id in nodes){
            var node = nodes[id];
            if(!node.visible)continue;
            var dist = Math.hypot(node.x-x,node.y-y);
            if(dist < node.r){
                return node;
            }
        }
        return false;
    };
    var findEdge = function(x,y){
        var r = 5;
        for(var id in edges){
            var edge = edges[id];
            if(!edge.visible)continue;
            var v1 = nodes[edge.v1];
            var v2 = nodes[edge.v2];
            var x0 = x-v1.x;
            var y0 = y-v1.y;
            var a = v2.x-v1.x;
            var b = v2.y-v1.y;
            var c = Math.hypot(a,b);
            var x1 = x0*(a/c)-y0*(-b/c);
            var y1 = x0*(-b/c)+y0*(a/c);
            if(x1 > 0 && x1 < c && y1 > -r && y1 < r){
                return edge;
            }
        }
        return false;
    };
    var inside = function(p1,p2){
        var dist = Math.hypot(p1.x-p2.x,p1.y-p2.y);
        if(dist < p1.r){
            return true;
        }
        return false;
    }
    var flag;
    var before;
    var startPoint;

    var tempnode,tempnode2,tempedge;
    if(true){
        var temp = true;
        var id1 = randomid();
        tempnode = {x:0,y:0,r:5,edges:{},visible:false,id:id1,temp,color:"#000"};
        nodes[id1] = tempnode;

        var id2 = randomid();
        tempnode2 = {x:0,y:0,r:5,edges:{},visible:false,id:id2,temp,color:"#000"};
        nodes[id2] = tempnode2;

        var id3 = randomid();
        tempedge = {v1:id1,v2:id2,visible:false,id:id3,temp,color:"#000"};
        edges[id3] = tempedge;
    }

    this.mouseDown = function({x,y}){
        startPoint = {x,y,r:5};
        var node = findNode(x,y);
        if(node){//if node point on
            flag = "node";
            before = node;
            return false;
        }
        var edge = findEdge(x,y);
        if(edge){
            flag = "edge";
            before = edge;
            return false;
        }
        //mousedown to air
        flag = "air";
        before = null;

    };
    this.mouseMove = function({x,y}){
        tempnode.visible = false;
        tempnode2.visible = false;
        tempedge.visible = false;
        if(flag === "node"){
            var node = findNode(x,y);
            if(node){//if node point on
                //if same node
                if(node === before){
                    //do nothing
                    return false;
                }else{// not the same node draw temp vert
                    tempedge.visible = true;
                    tempedge.v1 = before.id;
                    tempedge.v2 = node.id;
                    return false;
                }
            }
            /*var edge = findEdge(x,y);
            if(edge){
                //temp split

            }*/
            //if to air
            tempnode.visible = true;
            tempnode.x = x;
            tempnode.y = y;
            tempedge.visible = true;
            tempedge.v1 = tempnode.id;
            tempedge.v2 = before.id;
            return false;
        }else if(flag === "edge" || flag === "air"){
            //start point to node
            /*if(inside(startPoint,{x,y})){

            }*/
            //draw two nodes and connecting line
            var node = findNode(x,y);
            if(node){
                tempnode.visible = true;
                tempedge.visible = true;
                tempnode.x = startPoint.x;
                tempnode.y = startPoint.y;
                tempedge.v1 = tempnode.id;
                tempedge.v2 = node.id;
                return false;
            }
            tempnode.visible = true;
            tempnode2.visible = true;
            tempedge.visible = true;
            tempnode.x = x;
            tempnode.y = y;
            tempnode2.x = startPoint.x;
            tempnode2.y = startPoint.y;
            tempedge.v1 = tempnode.id;
            tempedge.v2 = tempnode2.id;
            return false;
        }
    };
    this.mouseUp = function({x,y}){
        console.log("fired");
        tempnode.visible = false;
        tempnode2.visible = false;
        tempedge.visible = false;
        if(flag === "node"){
            //node to node
            var node = findNode(x,y);
            if(node){//if node point on
                //if same node
                if(node === before){
                    //delete node
                    deleteNode(node.id);
                    return false;
                }else{// new edge
                    addEdge(node.id,before.id);
                    return false;
                }
            }
            var edge = findEdge(x,y);
            if(edge){
                //split the edge and make a new node
                var vm = addNode({x,y});
                var v1 = edge.v1;
                var v2 = edge.v2;
                addEdge(vm,v1);
                addEdge(vm,v2);
                deleteEdge(edge.id);

                addEdge(vm,before.id);
                return false;
            }
            //if to air
            //add new node and vert
            var vn = addNode({x,y});
            var v1 = before.id;
            addEdge(vn,v1);
            return false;
        }else if(flag === "edge"){
            var node = findNode(x,y);
            if(node){//edge to node
                //split the edge and make a new node
                var vm = addNode(startPoint);
                var v1 = before.v1;
                var v2 = before.v2;
                addEdge(vm,v1);
                addEdge(vm,v2);
                deleteEdge(before.id);

                addEdge(vm,node.id);
                return false;
            }
            var edge = findEdge(x,y);
            if(edge){
                if(edge === before){//delete
                    deleteEdge(edge.id);
                    return false;
                }
                //edge to edge
                //split bith and make new nodes
                var vm1 = addNode({x,y});
                var v11 = edge.v1;
                var v21 = edge.v2;
                addEdge(vm1,v11);
                addEdge(vm1,v21);
                deleteEdge(edge.id);

                var vm2 = addNode(startPoint);
                var v12 = before.v1;
                var v22 = before.v2;
                addEdge(vm2,v12);
                addEdge(vm2,v22);
                deleteEdge(before.id);

                addEdge(vm1,vm2);

                return false;
            }
            //edge to air
            //split and make new node
            var vn = addNode({x,y});
            var vm = addNode(startPoint);
            var v1 = before.v1;
            var v2 = before.v2;
            addEdge(vm,v1);
            addEdge(vm,v2);
            deleteEdge(before.id);

            addEdge(vn,vm);
            return false;
        }else if(flag === "air"){
            var node = findNode(x,y);
            if(node){//air to node
                //new node and edge
                var vn = addNode(startPoint);
                addEdge(vn,node.id);
                return false;
            }
            cnt++;
            var edge = findEdge(x,y);
            if(edge){
                //air to edge
            console.log(v1,vx);
                //split and make new, and connect to new point
                var vn = addNode(startPoint);

                var vm = addNode({x,y});
                var v1 = edge.v1;
                var v2 = edge.v2;
                addEdge(vm,v1);
                addEdge(vm,v2);
                deleteEdge(edge.id);

                addEdge(vm,vn);
                return false;
            }
            //air to air
            //split and make new node
            var vn1 = addNode(startPoint);
            var vn2 = addNode({x,y});
            addEdge(vn1,vn2);
            return false;
        }
    };
    //dt = dt/1000;
    //this.calcStep({})
    this.calcTime = 0;
    this.calcStep = function({dt,t}){
        if(t-bridge.calcTime > 10000){
            alert("game clear");
        }
        if(weightball.y > height){
            alert("game over");
        }
        for(var id in nodes){
            var v1 = nodes[id];
            if(v1.temp)continue;
            if(v1.immobile)continue;
            v1.x += v1.vx*dt;
            v1.y += v1.vy*dt;
            v1.vx *= 0.9;
            v1.vy *= 0.9;
            v1.vy += 1000*dt;
            for(var id2 in v1.edges){
                var edge = edges[id2];
                //console.log(v1.edges[id2]);
                if(edge.temp)continue;
                var v2 = edge.v1 === id ? nodes[edge.v2]:nodes[edge.v1];
                //console.log(v2,edge,id);
                var dx = v2.x-v1.x;
                var dy = v2.y-v1.y;
                var d = Math.hypot(dx,dy);
                var ratio = d/edge.n;
                if(ratio < 0.9 || ratio > 1.05){
                    deleteEdge(edge.id);
                }
                var dl = d - edge.n;
                var f = dl*edge.k;
                var a = f/v1.mass;
                var dv = a*dt;
                v1.vx += dv*dx/d;
                v1.vy += dv*dy/d;
            }
        }
    }
};




var canvas = BODY.add("canvas").e;
var width = 1000;
var height = 500;
canvas.width = width;
canvas.height = height;
var ctx = canvas.getContext("2d");
var bridge = new Bridge({ctx,width,height});

var down = false;
canvas.addEventListener("mousedown",function(e){
    down = true;
    console.log("dfasdf");
    var x = e.clientX + scrollX - canvas.offsetLeft;
    var y = e.clientY + scrollY - canvas.offsetTop;
    console.log(x,y);
    bridge.mouseDown({x,y});
});


canvas.addEventListener("mousemove",function(e){
    if(!down)return false;
    var x = e.clientX + scrollX - canvas.offsetLeft;
    var y = e.clientY + scrollY - canvas.offsetTop;
    bridge.mouseMove({x,y});
});

canvas.addEventListener("mouseup",function(e){
    var x = e.clientX + scrollX - canvas.offsetLeft;
    var y = e.clientY + scrollY - canvas.offsetTop;
    bridge.mouseUp({x,y});
    down = false;
});



var calcFlag = false;
game.on("frame",({dt,t})=>{
    bridge.render();
    if(calcFlag){
        dt = dt/1000;
        bridge.calcStep({dt,t});
    }
});

BODY.add("style",`
.start, .reset{
    width:80px;
    line-height:40px;
    color:#fff;
    border-radius:5px;
    font-size:30px;
    text-align:center;
    display:inline-block;
}
.start{
    background-color:#00f;
}
.reset{
    background-color:#f00;
}
`);
BODY.add("br");
BODY.add("div","start","class:start").e.addEventListener("click",()=>{
    calcFlag = true;
    bridge.calcTime = game.t;
});
BODY.add("span"," ");
//BODY.add("div","reset","class:reset").e.addEventListener("click",()=>{
//    calcFlag = true;
//});



