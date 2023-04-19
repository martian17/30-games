BODY.add("style",`
.poperror{
    position:absolute;
    top:-28px;
    padding:5px 10px;
    left:0px;
    background-color:#faa;
    border-radius:5px;
    border:solid 1px #f00;
    color:#f00;
    display:none;
}
.poperror::before{
    content:"";
    width:0px;
    height:0px;
    border-top:solid 6px #f00;
    border-left:solid 6px #0000;
    border-right:solid 6px #0000;
    position:absolute;
    bottom:-6px;
    left:9px;
}
.poperror::after{
    content:"";
    width:0px;
    height:0px;
    border-top:solid 5px #faa;
    border-left:solid 5px #0000;
    border-right:solid 5px #0000;
    position:absolute;
    bottom:-5px;
    left:10px;
}

.poperror-wrapper{
    position:relative;
}

`);


var PopError = function(elem){
    //appears above the elem
    var paren = elem.parentNode;
    var wrapper = new ELEM("div",false,"class:poperror-wrapper").e;
    paren.insertBefore(wrapper,elem);
    var pop = new ELEM("div",false,"class:poperror").e;
    wrapper.appendChild(pop);
    wrapper.appendChild(elem);
    this.hide = function(){
        pop.style.display = "none";
    };
    this.show = function(content){
        pop.innerHTML = content;
        pop.style.display = "block";
    }
    var that = this;
    pop.addEventListener("click",()=>{
        that.hide();
    });

}