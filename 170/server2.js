const express = require("express");
const jsonParser = bodyParser.json();
const ws = require("ws");
const app = express();
app.use(express.static(path.join(__dirname,"static/")));


app.use(jsonParser);

var randomid = function(){
    return Math.random().toString(36).slice(2);
};

var users = require("user-service2.js");
var rooms = require("room-service2.js");

app.post("newusr",(req,res)=>{
    var name = req.user.name;
    if(user.nameExist(name)){
        //found a duplicate
        res.status(400).send("username already exists");
        return false;
    }
    var user = users.add({name});
    var id = user.id;
    var token = user.token;
    var id = randomid();
    var token = randomid();
    //                                   same format as the acceptinng format
    res.status(200).send(JSON.stringify({user:{id,token}}));//session id
});
app.listen(3000);

//socket
const WebSocket = require("ws");
var wss = new WebSocket.server({port:3000});

wss.on("connection",function(ws,req){
    //first ever connection
    var listener = ws.on("message");

});

wss.on("connection",function(ws,req){
    //first time connection
    var authed = false;
    ws.on("message",(msg)=>{
        if(authed)return false;//only works on the first try
        msg = JSON.parse(msg);
        if(msg.type === "auth"){
            var user = users.id(msg.id);
            if(!user){
                ws.close();
                return false;
            }
            if(user.token !== msg.token){//only time to use token
                ws.close();
                return false;
            }
            user.ws = ws;
            ws.send(JSON.stringify({
                type:"auth-acknowledgement"
            }));
            authed = true;
            onWsAuth(ws,user);
        }else{
            ws.close();
            return false;
        }
    });

    //if five seconds pass without authentication, close the connection
    setTimeout(()=>{
        if(!authed)ws.close();
    },5000);
});

var unWsAuth = function(ws,req){
    if(msg.type === "auth"){

    }
}

const wss = new WebSocket.Server({ port: 3000 });
wss.on("connection", function connection(ws, req) {
    var ponged = false;
    ws.on("message",(msg)=>{
        if(ponged)return false;//only one authentication
        msg = JSON.parse(msg);
        if(msg.type === "auth"){
            var user = users.id(msg.id);
            if(user.token !== msg.token){//only time to use token
                return false;
            }
            if(!user){
                return false;
            }
            ponged = true;
            user.ws = ws;
            ws.send(JSON.stringify({
                type:"auth-acknowledge"
            }));
            onWsAuth(ws,user);
        }
    });
    //garbage collect the unresponsive clients
    setTimeout(()=>{
        if(!ponged)ws.close();
    },5000);
});

var onWsAuth = function(ws,user){
    ws.on("message",function(msg){
        msg = JSON.parse(msg);
        if(msg.type === "rename"){
            var name = msg.user.name;
            var id = msg.user.id;
            var id = req.user.id;
            var result = users.rename(id,name);
        }else if(msg.type === "join-random-room"){

        }else if(msg.type === "create-new-room"){

        }else if(msg.type === "join-room"){
            user.room =
            msg.room.id;
        }
    });
    /*ws.on("message", function incfalseoming(message) {
        if(){

        }
    console.log("received: %s", message);
    })
    .on("authenticate", function(payload){
        console.log(payload);
    });
    setInterval(()=>{
        ws.send("asdf");
    },1000);*/
};