var randomid = function(){
    return Math.random().toString(36).slice(2);
};
var getKey = function(obj){
    for(key in obj){
        return key;
    }
    return false;
};
var isVectorInbetween = function(origin,v1,v2,v3){
    var a1 = Math.atan2(v1.x-origin.x,v1.y-origin.y);
    var a2 = Math.atan2(v2.x-origin.x,v2.y-origin.y);
    var a3 = Math.atan2(v3.x-origin.x,v3.y-origin.y);
    var a2d = (a2-a1+Math.PI)%Math.PI;
    var a3d = (a3-a1+Math.PI)%Math.PI;
    if(a3d > a2d){
        return true;
    }else{
        return false;
    }
};


/*
//prototypes and constructors
var Vert = function(x,y){
    this.type = VERT;
    this.id = randomid();
    this.x = x;
    this.y = y;
    this.edges = {};
    this.connections = {};//linked list of vertices
    this.faces = {};
};
var */

var Polygon = function(ctx){
    this.verts = {};
    this.edges = {};
    this.faces = {};//collection of edges
    //symbols and identifiers
    const VERT = 0;
    const EDGE = 1;
    const FACE = 2;
    const AIR = 3;

    //basic operations first
    this.addVert = function(x,y){
        var id = randomid();
        var vert = {
            type:VERT,
            id,x,y,
            edges:{},
            connections:{},//linked list of vertices
            faces:{}
        };
        this.verts[id] = vert;
        return vert;
    };
    this.insertVertToVert = function(v0,v1){//insert v1 to v0
        var id0 = getKey(v0.connections);
        if(!id0){//no connection
            v0.connections[v1.id] = v1.id;
        }else{
            var id = id0;
            var cs = v0.connections;
            while(true){
                if(isVectorInbetween(v0,this.verts[id],v1,this.verts[cs[id]])){
                    var id1 = cs[id];
                    //insert v0 between this.verts[id] and this.verts[cs[id]]
                    cs[id] = v1.id;
                    cs[v1.id] = id1;
                    break;
                }
                id = cs[id];
                if(id === id0){//didn't find a match
                    //just jam it in there
                    var id1 = cs[id];
                    cs[id] = v1.id;
                    cs[v1.id] = id1;//successfully jammed
                    break;
                }
            }
        }
    };
    this.addEdge = function(v0,v1){
        //finding a new face
        var id = randomid();
        var edge = {
            type:EDGE,
            id,
            v0:v0.id,
            v1:v1.id,
            faces:{}
        };
        this.edges[id] = edge;
        //updating the vertices
        var id = id0;
        insertVertToVert(v0,v1);
        insertVertToVert(v1,v0);

        //vertices "connections"

        //check if it's created a new face
        while(true){

        }
        return edge;
    };
    this.addFace = function(){//automatic when adding an edge
        var id = randomid();
        var face = {
            type:FACE,
            id,
            connections:{},//linked list of vertices
            color:"#aaa"
        };
        return face;
    };

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