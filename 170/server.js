const express = require("express");
const jsonParser = bodyParser.json();
const ws = require("ws");
const app = express();
app.use(express.static(path.join(__dirname,"static/")));


app.use(jsonParser);

var randomid = function(){
    return Math.random().toString(36).slice(2);
};

var users = require("user-service.js");
var rooms = require("room-service.js")(users);

app.post("newusr",(req,res)=>{
    var name = req.user.name;
    var id = randomid();
    var token = randomid();
    var user = users.add({name,id,token});
    if(!user){
        res.status(400).send("username already exists");
    }
    res.status(200).send(JSON.stringify({id,token}));//session id
});




app.listen(3000);

//socket
const WebSocket = require("ws");

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