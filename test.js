const { Server, Client } = require("./index.js");
const server = new Server()
server.onconnect(function(socket){
    console.log("server callback")
    socket.emit("greetings", "hello");
    socket.on("end", function(){
        console.log("client left :(")
    });
});
server.listen(8080);

const client = new Client();
client.connect({host: "localhost", port: 8080}, function(server){
    console.log("client callback")
    server.on("greetings", function(data){
        console.log(data)
    });
});