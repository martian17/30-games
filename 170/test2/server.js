const express = require("express");
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const app = express();
const path = require("path");
app.use(express.static(path.join(__dirname,"static/")));


app.use(jsonParser);

var randomid = function(){
    return Math.random().toString(36).slice(2);
};

var users = require("./user-service.js");
//var rooms = require("room-service.js");

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
    res.status(200).send(JSON.stringify({id,token}));//session id
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