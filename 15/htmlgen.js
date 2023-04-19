//make the attribute parser
var attrParser = function(str){
    //escape ":" and ";"
    var attrs = [["",""]];
    var mode = 0;
    for(var i = 0; i < str.length; i++){
        var attr = attrs.pop();
        var char = str[i];
        if(char === "_"){//escape character
            attr[mode] += str[i+1];
            i++;
            attrs.push(attr);
        }else if(char === ":"){
            mode++;
            attrs.push(attr);
        }else if(char === ";"){
            mode = 0;
            attrs.push(attr);
            attrs.push(["",""]);
        }else{
            attr[mode] += str[i];
            attrs.push(attr);
        }
    }
    attrs = attrs.filter((a)=>{
        if(a[0] === ""){
            return false;
        }
        return true;
    });
    return attrs;
};


var ADDELEMFUNC = function(nname,inner,attr,style){
    if(nname.add === ADDELEMFUNC){//it's an object
        this.e.appendChild(nname.e);
        return nname;
    }else{//it's a string or element, which will be taken care of by ELEM
        var eelem = new ELEM(nname,inner,attr,style);
        this.e.appendChild(eelem.e);
        return eelem;
    }
};

var ADDATTRFUNC = function(a,b){
    this.e.setAttribute(a,b);
};


var ELEM = function(nname,inner,attr,style){
    if(typeof nname === "string"){
        var e = document.createElement(nname);
        if(inner)e.innerHTML = inner;
        if(attr){
            attrParser(attr).map((a)=>{
                e.setAttribute(a[0],a[1]);
            });
        }
        if(style)e.style = style;
        this.e = e;
    }else{//nname is an element
        this.e = nname;
    }
    this.add = ADDELEMFUNC;
    this.attr = ADDATTRFUNC;
};

var BODY = (new function(){
    this.e = document.body;
    this.add = ADDELEMFUNC;
    this.attr = ADDATTRFUNC;
}());