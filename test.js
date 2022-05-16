const package = require("./index.js");

const server = new package.Server();
server.onconnect(function(socket){
    socket.on("event", function(data){
        console.log(data);
        socket.emit("event", "hello");
    });
    socket.on("end", function(){
        console.log("yay");
    });
});
server.listen(8080, console.log("Listening to port 8080"));

const client = new package.Client();
client.connect({host: "localhost", port: 8080}, function(server){
    server.emit("event", "test");
    server.on("event", function(data){
        console.log(data)
    });
});