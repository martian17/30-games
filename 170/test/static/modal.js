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

BODY.add("style",`
.modal-outer{
    display:none;
    position:fixed;
    top:0px;
    left:0px;
    width:100vw;
    height:100vh;
    background-color:#0008;
}

.modal-inner{
    width:300px;
    background-color:#fff;
    margin:200px auto;
    border-radius:10px;
    padding:20px;
    text-align:center;
}

`);


var Modal = function(){
    var outer = BODY.add("div",false,"class:modal-outer");
    var inner = outer.add("div",false,"class:modal-inner");
    this.add = inner.add;
    this.e = inner.e;
    this.show = async function(duration=300){//negative value for synchronous transition
        outer.e.style.display = "block";
        await animation.transition(duration,(r)=>{
            outer.e.style.opacity = r;
        });
        return true;
    };
    this.hide = async function(duration=300){
        await animation.transition(duration,(r)=>{
            outer.e.style.opacity = 1-r;
        });
        outer.e.style.display = "hidden";
        return true;
    };
    this.remove = function(){
        document.body.removeChild(outer.e);
    };
    this.close = async function(){
        await this.hide();
        this.remove();
        return true;
    };
};