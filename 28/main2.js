BODY.add("style",0,`
body{
    margin:0px;
}
.col{
    width:50%;
    height:100vh;
    float:left;
    display:grid;
    place-items:center;
}


.cup{
    width:100%;
    height:0px;
    padding-top:200%;
    background-color:#ccc;
}

`);


var left = BODY.add("div","class:col");
var right = BODY.add("div","class:col");

var cup1 = left.add("div","class:cup-w");
cup1.add("div","class:cup");
var rim1 = cup1.add("div","class:cup-rim")
rim1.add("div","class:cup-rim-i");

