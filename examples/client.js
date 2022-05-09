const package = require("../index.js");
const client = new package.Client();
client.connect({host: "localhost", port: 8080}, function(server){
    server.emit("event", "test");
    server.on("event", function(data){
        console.log(data)
    });
    server.on("end", function(){
        console.log("yay")
    });
});