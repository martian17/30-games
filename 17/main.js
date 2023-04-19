var animation = new (function(){
    var resolveFrame = [];
    this.nextFrame = function(){
        return new Promise((resolve,reject)=>{
            resolveFrame.push(resolve);
        });
    };
    this.transition = async function(duration,func){
        var t = 0;
        while(t < duration){
            func(t/duration);
            var dt = await this.nextFrame();
            t += dt;
        }
        func(1);
        return true;
    }
    this.sleep = function(t){
        return new Promise((resolve,reject)=>{
            setTimeout(resolve,t);
        });
    };
    this.isStop = false;
    this.stop = function(){
        this.isStop = true;
    }
    this.resume = function(){
        this.isStop = false;
        requestAnimationFrame(this.animate);
    }
    this.frame = function(){};
    var that = this;
    var start = 0;
    var tt = 0;
    var dtt = 0;
    animate = function(t){
        if(start === 0)start = t;
        var dt = t - start;
        start = t;
        tt = t;
        dtt = dt;
        if(that.isStop){
            return false;
        }
        for(var i = 0; i < resolveFrame.length; i++){
            resolveFrame[i](dt);
        }
        resolveFrame = [];
        that.frame(dt,t);
        requestAnimationFrame(animate);
    }
    
    this.returnFrame = function(){
        for(var i = 0; i < resolveFrame.length; i++){
            resolveFrame[i](dtt,tt);
        }
        resolveFrame = [];
        that.frame(dtt,tt);
    };
    requestAnimationFrame(animate);
})();


var formatNumber = function(t){
    var sf = (t+"").split(".");
    var s = sf[0];
    s = s.slice(-2);
    if(s.length === 0){
        s = "00";
    }else if(s.length === 1){
        s = "0"+s;
    }
    var f = sf[1] || "00";
    f = f.slice(-2);
    if(f.length === 0){
        f = "00";
    }else if(f.length === 1){
        f = f+"0";
    }
    return s+"."+f;
}

BODY.add("style",`
body{
    text-align:center;
    display:grid;
    place-items:center;
    min-height:100vh;
    font-size:30px;
}
.msg{
}
.displayO{
    width:300px;
    line-height:50px;
    position:relative;
    background-color:#ddd;
    margin:20px 0px;
}

.lidu{
    width:100%;
    height:0%;
    background-color:#f88;
    position:absolute;
    top:0px;
}
.lidd{
    width:100%;
    height:0%;
    background-color:#f88;
    position:absolute;
    bottom:0px;
}
.button{
    display:inline-block;
    padding:5px 20px;
    background-color:#0ff;
}

`);

var container = BODY.add("div");
var msg = container.add("div",false,"class:msg").e;
var displayO = container.add("div",false,"class:displayO");
var display = displayO.add("div",false,"class:display").e;
var lidu = displayO.add("div",false,"class:lidu").e;
var lidd = displayO.add("div",false,"class:lidd").e;

var btresolve = ()=>{};
var buttonClick = function(){
    return new Promise((resolve,reject)=>{
        btresolve = resolve;
    });
}

var button = container.add("div",false,"class:button").e;
button.addEventListener("click",function(){
    btresolve();
    btresolve = ()=>{};
});

var lids = {
    close:function(){
        animation.transition(500,(r)=>{
            lidu.style.height = (r*50)+"%";
            lidd.style.height = (r*50)+"%";
        });
    },
    open:function(){
        animation.transition(500,(r)=>{
            r = 1-r;
            lidu.style.height = (r*50)+"%";
            lidd.style.height = (r*50)+"%";
        });
    }
}

var game = async function(){
    var T = 8+Math.floor(Math.random()*5);
    msg.innerHTML = "aim for exactly "+T+" seconds";
    button.innerHTML = "Start";
    var t = 0;
    display.innerHTML = formatNumber(t);
    await buttonClick();
    var st = Date.now();
    button.innerHTML = "Stop";
    var stopped = false;
    buttonClick().then(()=>{
        stopped = true;
        animation.returnFrame();
    });
    var closed =false;
    while(true){
        if(stopped){
            break;
        }
        await animation.nextFrame();
        t = (Date.now()-st)/1000;
        if(t > 3 && !closed){
            closed = true;
            lids.close();
        }
        display.innerHTML = formatNumber(t);
    }
    lids.open();
    
    button.innerHTML = "Retry";
    await buttonClick();
    game();
};

game();