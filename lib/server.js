module.exports = class {
    constructor(options){
        this.__crypto = require("./crypto.js");
        if(options){
            if(options.publicKey || options.privateKey){
                if(options.publicKey && options.privateKey){
                    this.__crypto(options.publicKey, options.privateKey);
                }else{
                    throw "Must provide both keys";
                }
            }else{
                this.__crypto();
            }
        }else{
            this.__crypto();
        }
        this.privateKey = this.__crypto.privateKey;
        this.publicKey = this.__crypto.publicKey;
        this.__server = new require("net").Server();
    }
    onconnect(callback){
        var crypto = this.__crypto;
        var publicKey = this.publicKey;
        var server = this.__server;
        var untilauth = new Promise(function(resolve){
            server.on("connection", function(socket){
                socket.write(Buffer.from(publicKey));
                var vsock = {
                    callbacks: {},
                    on: function(event, callback){
                        this.callbacks[event] = callback;
                    }
                }
                var clientKey;
                var clientReady = false;
                socket.on("data", function(chunk){
                    if(!clientKey || !clientReady){
                        if(chunk.toString() == "ready"){
                            console.log("server detected ready")
                            clientReady = true;
                        }else{
                            console.log("server got key")
                            clientKey = chunk.toString();
                            console.log(clientKey)
                            socket.write(Buffer.from("ready"));
                            vsock.emit = function(event, data){
                                if(event == "end"){
                                    throw "Illegal event: end";
                                }
                                socket.write(Buffer.from(JSON.stringify([event, crypto.encryptAndSign(clientKey, data), Date.now()])));
                            }
                        }
                        console.log("server: " + Boolean(clientKey), clientReady)
                        if(clientKey && clientReady) resolve(vsock);
                    }else{
                        var data = JSON.parse(chunk.toString());
                        if(vsock["callbacks"][data[0]]){
                            var forwarded = crypto.decryptedAndVerify(clientKey, data[1]);
                            forwarded.sent = data[2];
                            forwarded.recieved = Date.now();
                            vsock["callbacks"][data[0]](forwarded);
                        }
                    }
                });
                socket.on("end", function(){
                    if(vsock["callbacks"]["end"]){
                        vsock["callbacks"]["end"]();
                    }
                });
            });
        });
        untilauth.then(callback);
    }
    listen(PORT, callback){
        this.__server.listen(PORT, callback);
    }
}