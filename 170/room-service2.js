var randomid = function(){
    return Math.random().toString(36).slice(2);
};

var Room = function(){

};


var ROOMS = var users = (new (function(){
    this.ids = {};
    this.pins = {};
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

module.export(ROOMS);