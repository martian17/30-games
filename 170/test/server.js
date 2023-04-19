const express = require("express");
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const app = express();
const path = require("path");
app.use(express.static(path.join(__dirname,"static/")));


app.use(jsonParser);
var no = {};

var randomid = function(){
    return Math.random().toString(36).slice(2);
};

const users = require("./user-service.js");
//var rooms = require("room-service.js");

//rest requests
app.post("/new-user",(req,res)=>{
    var name = req.body.name;
    if(users.nameExist(name)){
        //found a duplicate
        res.status(400).json(no);
        return false;
    }
    var user = users.add({name});
    var id = user.id;
    var token = user.token;
    res.status(200).json({id,token,name});//session id
});
app.post("/user-exists",(req,res)=>{
    var user = req.body;
    console.log(user);
    if(user.id){
        var user = users.id(user.id);
        if(user){
            res.status(200).json(no);
        }else{
            res.status(400).json(no);
        }
    }else{
        res.status(400).json(no);
    }
});

app.listen(3000);

//socket
const WebSocket = require("ws");
console.log(WebSocket);
var wss = new WebSocket.Server({port:3001});

wss.on("connection",function(ws,req){
    var authed = false;
    //first ever connection
    var handler = function(msg){
        msg = JSON.parse(msg);
        if(msg.type === "auth"){
            var user = users.id(msg.id);
            if(!user || user.token !== msg.token){//no matching user or evil
                ws.send(JSON.stringify({
                    type:"user-not-found"
                }));
                return false;
            }
            ws.removeListener("message",handler);
            user.ws = ws;
            ws.send(JSON.stringify({
                type:"auth-acknowledgement"
            }));
            authed = true;
        }else{
            //unexpected connection, close it
            ws.close();
        }
        //garbage collected
    }
    ws.on("message",handler);
    setTimeout(()=>{
        if(!authed)ws.close();
    },500);
});