
var Field = function(){//field where you put all your cards
    this.cards = [];
    
}

var Ehand = function(){
    var wrapper = new ELEM("div","class:ehand-wrapper");
    
    this.getLength = function(){
        return wrapper.children.length;
    };
    
    this.insertCard = function(card,n){//n === z-index
        wrapper.add(card);
    };
    
    this.setNum = function(n){//setting the number of cards
        var clen = wrapper.children.length;
        if(clen < n){
            wrapper.add("div","class:back-card");
        }else if(clen > n){
            
        }
    }
}

var Enemy = function(){//enemy things
    this.showard = function(){
        
    }
}



var Board = function(){
    this.players = {};//reference by id
    this.cards = {};
    this.sync = function(data){
        for(var i = 0; i < ){
            
        }
    }
    
    this.stack = new Stack();
    
    
    
    this.render = function(){
        
    }
}


var Card = function(){
    
    this.move = function(){//from where to where
        
    }
    this.remove = function(){
        
    }
}