var promisewatch = function(promise){
    promise.then((a)=>{
        console.log(a);
    }).catch((err)=>{
        console.log("error");
        console.log(err);
    });
}