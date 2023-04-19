var User = function({id,name,token}){
    this.id = id;
    this.name = name;
    this.token = token;
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
        if(this.room){
            this.room.removeUser(this.id);
        }
    }
};

var users = (new (function(){
    this.ids = {};
    this.names = {unknown:0};
    this.add = function({id,name,token}){
        //default user
        if(name === "unknown"){
            var user = new User({id,name,token});
            this.ids[id] = user;
            this.names[name] = user;
            return user;
        }

        if(name in this.names){
            return false;
        }
        var user = new User({id,name,token});
        this.ids[id] = user;
        this.names[name] = user;
        return user;
    };
    this.remove = function(id){
        var user = ids[user];
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
    this.rename = function(id,name){
        if(name in this.names)return false;
        var user = this.ids[id];
        user.name = name;
        return true;
    };
})());

module.export = users;

