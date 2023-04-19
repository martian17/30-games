

var rest = (new (function(){
    //all json
    var host = window.location.protocol+"//"+window.location.host;
    this.get = function(url){
        return new Promise((resolve,reject)=>{
            var xhr = new XMLHttpRequest();
            xhr.addEventListener("error",(err)=>{
                reject(err);
            });
            xhr.onreadystatechange(()=>{
                if (xhr.readyState === 4) {
                    var result = {
                        body:JSON.parse(xhr.responseText),
                        status:xhr.status
                    };
                    resolve(result);
                }
            });
            xhr.open("GET", host+url);//async default true
            xhr.send();
        });
    };
    this.post = function(url,content){
        return new Promise((resolve,reject)=>{
            var xhr = new XMLHttpRequest();
            xhr.addEventListener("error",(err)=>{
                console.log("error");
                console.log(err);
                reject(err);
            });
            console.log(host+url,content);
            xhr.onreadystatechange = function(){
                if (xhr.readyState === 4) {
                    console.log(xhr);
                    var result = {
                        body:JSON.parse(xhr.responseText),//could be problematic
                        status:xhr.status
                    };
                    resolve(result);
                }
            };
            xhr.open("POST", host+url);//async default true
            xhr.setRequestHeader("Content-type", "application/json");
            xhr.send(JSON.stringify(content));
        });
    };
})());