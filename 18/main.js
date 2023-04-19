var time = BODY.add("div","0.00","class:time").e;
var view = BODY.add("div",false,"class:view");

BODY.add("style",`
body{
    font-family:"Courier New", Courier, monospace;
}
.time{
    font-size:30px;
}
.view{
    width:200px;
    height:200px;
}
.cell{
    float:left;
    width:10%;
    height:10%;
    text-align:center;
}
`);




var animation = new (function(){
    var resolveFrame = [];
    this.nextFrame = function(){
        return new Promise((resolve,reject)=>{
            resolveFrame.push(resolve);
        });
    };
    this.frame = function(){};
    var that = this;
    var start = 0;
    var animate = function(t){
        if(start === 0)start = t;
        var dt = t - start;
        start = t;
        for(var i = 0; i < resolveFrame.length; i++){
            resolveFrame[i](dt);
        }
        resolveFrame = [];
        that.frame(dt);
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
})();

var session = async function(){
    view.e.innerHTML = "";
    time.innerHTML = "0.00";
    var arr = [];
    for(var i = 0; i < 100; i++){
        var cell = view.add("div","間","class:cell");
        arr[i] = cell.e;
    }

    var cell = arr[Math.floor(arr.length*Math.random())];
    cell.innerHTML = "問";
    var going = true;
    cell.addEventListener("click",()=>{
        going = false;
        setTimeout(()=>{alert("Game Clear! Time: "+time.innerHTML)},100);
    });
    var t = 0;
    while(going){
        t += await animation.nextFrame();
        var sec = (t/1000)+"";
        time.innerHTML = sec.slice(0,6);
    }
};

session();