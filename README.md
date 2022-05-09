# sect
TCP speeds + HTTPS Security

```js
const { Server, Client } = require("sect");
const server = new Server()
server.onconnect(function(socket){
    socket.emit("greetings", "hello");
    socket.on("end", function(){
        console.log("client left :(")
    });
});
server.listen(8080);

const client = new Client();
client.connect({host: "localhost", port: 8080}, function(server){
    server.on("greetings", function(data){
        console.log(data)
    });
});
```

## Features
- High performance tcp connectivity
- Assymetrical encryption and seal verification for high security
- Robust and simple socket system

## Documentation
- [Installation](#installation)
- [Servers](#servers)
  - [Creating server and listen to port](#creating-server-and-listen-to-port)
  - [Handeling connections](#handeling-connections)
  - [Recieving data](#recieving-data)
  - [Emitting data](#emitting-data)
- [Clients](#clients)
  - [Creating client and connecting to server](#creating-client-and-connecting-to-server)
  - [Recieving data](#recieving-data-1)
  - [Emitting data](#emitting-data-1)

## Installation
Using npm:
```shell
$ npm install -g npm
$ npm install sect
```
In Node.js:
```js
const { Server, Client } = require("sect");
```

## Servers
### Creating server and listen to port
The sect package comes with the Server class. To create a server, just run the constructor. If you have your own private and public keys, pass it in the constructor. Additionally, the listen method exposes the tcp server on the port given
```js
const { Server } = require("sect");
const server = new Server(/* {
    privateKey: <PRIV_KEY>,
    publicKey: <PUB_KEY>
} */); // you can provide your own credentials
server.listen(8080, console.log("Listening to port 8080"));
```

### Handeling connections
To catch when a connection occurs, use the ```.onconnect()``` method
```js
server.onconnect(function(socket){
    /*
    whatever you want to do
    */
});
```

### Recieving data
Socket has the ```.on()``` method to handle incoming events. This method has two parameters, the event and a callback function which passes the data from the event. There is only event that will not be handeled (for obvious reasons): "__auth"
```js
server.onconnect(function(socket){
    socket.on("event", function(data){
        console.log(data);
        /* this will log:
        {
            data: <DATA>,
            verified: <TRUE|FALSE>,
            sent: <TIMESTAMP>,
            recieved: <TIMESTAMP>
        }
        */
    });
});
```

### Emitting data
Socket has the ```.emit()``` method to send data to the socket. This takes two parameters, the event and the data. It will not allow you to send data with the "__auth" event
```js
server.onconnect(function(socket){
    socket.emit("event", "data");
});
```

## Clients
### Creating client and connecting to server
The sect package comes with the Client class. To create a client, just run the constructor. If you have your own private and public keys, pass it in the constructor. Additionally, you can connect to a server using the connect method. It takes two parameters: an object for the connection and a callback function which takes a server
```js
const client = new Client(/* {
    privateKey: <PRIV_KEY>,
    publicKey: <PUB_KEY>
} */); // you can provide your own credentials
client.connect({host: "localhost", port: 8080}, function(server){
    /*
    whatever you want to do
    */
});
```

### Recieving data
Server has the ```.on()``` method to handle incoming events. This method has two parameters, the event and a callback function which passes the data from the event. There is only event that will not be handeled (for obvious reasons): "__auth"
```js
client.connect({host: "localhost", port: 8080}, function(server){
    server.on("event", function(data){
        console.log(data);
        /* this will log:
        {
            data: <DATA>,
            verified: <TRUE|FALSE>,
            sent: <TIMESTAMP>,
            recieved: <TIMESTAMP>
        }
        */
    });
});
```

### Emitting data
Socket has the ```.emit()``` method to send data to the socket. This takes two parameters, the event and the data. It will not allow you to send data with the "__auth" event
```js
client.connect({host: "localhost", port: 8080}, function(server){
    server.emit("event", "data");
});
```