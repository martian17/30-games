/*
sequence of events


first time connection

ask the user for name and room and stuff
register through rest
as soon as verification, create a ws session


reconnection

ask the server if the user exists
if they do, create a ws connection
if they don't follow the first time connection protocol




*/


var renderRoom = function(room){

}

var main = async function(){
    var user = await getUser();
    console.log(user);

    /*
    var room = await getRoom(user);//joins a room inside
    //and get the room information
    //finally, render some shit
    renderRoom(room);
    */


    /*
    var room;
    if(room in user){
        room = user.room;
    }else{
        //create or join new room
        var room = await joinRandomRoom();
        room.//room pin
        if(){//already a room info

        }else{

        }
    }
    //start a web socket
    var ws = await wsLogin();
    //first get the full update

    await ws.

    //now the game starts
    */

};

var getUser = async function(){
    if(user in sessionStorage){
        var user = sessionStorage.user;
        if(await userExist(user)){
            //open the ws connection with the server
            return user;
        }else{
            return await createUser();
        }
    }else{
        return await createUser();
    }
};

BODY.add("style",`

.newuser-input, .newuser-submit, .newuser-create-room{
    display:inline-block;
    border-radius:5px;
    margin:10px 0px;
    width:100%;
    box-sizing:border-box;
    line-height:2em;
    font-size:1.5em;
    text-align:center;
}
.newuser-input{
    background-color:#ddd;
}
.newuser-submit{
    background-color:#4dff4d;
}
.newuser-create-room{
    background-color:#ffe847;
}
`);

var createUser = async function(){
    //open a popup box asking new user name
    return new Promise(async (resolve,reject)=>{//fix it someday
        var modal = new Modal();
        var inputE = modal.add("input",false,"type:text;class:newuser-input;placeholder:Your name here").e;
        var submitE = modal.add("div","Enter Game","class:newuser-submit").e;
        modal.add("div","Create a New Room","class:newuser-create-room");
        await modal.show(100);
        var popup = new PopError(inputE);

        submitE.addEventListener("click",async function(){
            popup.hide();
            //sends the user datat to the server and create a user
            var name = inputE.value;
            var result = await createUserServer(name).catch(()=>{
                popup.show("username already exists");
            });
            resolve(result.body);
            modal.close(100);
        });
    });
};


var userExist = async function(user){
    //simple and dumb
    var result = await rest.post("/user-exists",user);
    if(result.status === 200){
        return true;
    }else{
        //failed
        return false;
    }
};
var createUserServer = async function(name){
    var result = await rest.post("/new-user",{name});
    if(result.status === 200){
        return result;
    }else{
        //failed
        throw new Error("user aleady exists");
    }
}

main();

/*
var main = async function(){
    var {id,token} = await userCreation();
    console.log(id,token);
};

var userCreation = function(){
    return new Promise(async (resolve,reject)=>{

    });
}

var getUser = async function(){
    if(user in sessionStorage){
        var user = sessionStorage.user;
        var id = user.id;
        var token = user.token;
        await wsReady();
        ws.send(({type:"auth",id,token}));
        var msg = await nextMsg(ws);
        msg = JSON.parse(msg);
        if(msg.type === "auth-acknowledgement"){
            return msg;
        }else if(msg.type === "user-not-found"){
            return await createNewUser();
        }
        //else
        ws.close();
    }else{
        return await createNewUser();
    }
};

var createNewUser = async function(){

    await wsReady()
}

var nextMsg = function(ws){
    return new Promise((resolve,reject)=>{
        var handler = function(msg){
            ws.removeListener("message",handler);
            resolve(msg);
        };
        ws.on("message",handler);
        ws.on("close",function(){
            reject();
        });
    });
}


var flags = {
    wsReady:false
};
var ws = new WebSocket("ws://localhost:3001/", "http");

var wsReadyResolve = [];
var wsReady = function(){
    return new Promise((resolve,reject)=>{
        if(flags.wsReady){
            resolve();
        }else{
            wsReadyResolve.push(resolve);
        }
    });
};

var wsOpen =  function(){
    flags.wsReady = true;
    wsReadyResolve.map(a=>{a()});
    wsReadyResolve = [];
}

ws.on("open",wsOpen);
*/
