var randomid = function(){
    return Math.random().toString(36).slice(2);
};

var User = function(name){
    this.id = randomid();
    this.name = name;
    this.token = randomid();
    this.ws;
    this.send = function(msg){
        if(this.ws){
            ws.send(msg);
        }else{
            console.log("ws not found on user");
        }
    };
    this.room;
    this.remove = function(){
        users.remove(this.id);
        if(this.room){
            this.room.removeUser(this.id);
        }
    };
    this.rename = function(name){
        if(users.nameExist(name)){
            return false;
        }
        delete users.names[this.name];
        users.names[name] = this;
        this.name = name;
        return true;
    }
};

var users = (new (function(){
    this.ids = {};
    this.names = {unknown:0};
    this.add = function(name){
        var user = new User(name);
        this.ids[user.id] = user;
        this.names[name] = user;
        return user;
    };
    this.nameExist = function(name){
        if(name === "unknown"){
            return false;
        }
        if(name in this.names){
            return true;
        }
        return false;
    }
    this.remove = function(id){//hidden api
        var user = this.ids[id];
        var name = user.name;
        delete this.ids[id];
        delete this.names[name];
    };
    this.id = function(id){
        return this.ids[id];
    };
    this.name = function(name){
        return this.names[name];
    };
})());

module.exports = users;

