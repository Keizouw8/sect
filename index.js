module.exports.Server = class {
    constructor(options){
        this.__crypto = require("./crypto");
        if(options){
            if(options.publicKey || options.privateKey){
                if(!options.publicKey || options.privateKey){
                    console.error("Only provided one key, two needed.");
                    throw "Only provided one key, two needed.";
                }else{
                    this.privateKey = options.publicKey;
                    this.publicKey = options.privateKey;
                    this.__crypto(this.privateKey, this.publicKey);
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
        var vsock = {
            callbacks: {},
            on: function (event, callback){
                this.callbacks[event] = callback
            }
        }
        this.__server.on("connection", function(socket){
            var clientKey;
            socket.write(Buffer.from(JSON.stringify(["__auth", crypto.publicKey, Date.now()])));
            socket.on("data", function(chunk){
                if(JSON.parse(chunk.toString())[0] == "__auth"){
                    clientKey = JSON.parse(chunk.toString())[1];
                    vsock.emit = function(event, data){
                        if(emit != "__auth" || emit != "end"){
                            socket.write(Buffer.from(JSON.stringify([event, crypto.encryptAndSign(clientKey, data), Date.now()])));
                        }
                    };
                }else{
                    var forwarded = crypto.decryptedAndVerify(clientKey, JSON.parse(chunk.toString())[1]);
                    forwarded.sent = JSON.parse(chunk.toString())[2];
                    forwarded.recieved = Date.now();
                    vsock.callbacks[JSON.parse(chunk.toString())[0]](forwarded);
                }
            });
            socket.on("end", function(){
                vsock.callbacks["end"]();
            });
        });
        callback(vsock);
    }
    listen(PORT, callback){
        this.__server.listen(PORT, callback)
    }
}

module.exports.Client = class {
    constructor(options){
        this.__crypto = require("./crypto");
        if(options){
            if(options.publicKey || options.privateKey){
                if(!options.publicKey || options.privateKey){
                    console.error("Only provided one key, two needed.");
                    throw "Only provided one key, two needed.";
                }else{
                    this.privateKey = options.publicKey;
                    this.publicKey = options.privateKey;
                    this.__crypto(this.privateKey, this.publicKey);
                }
            }else{
                this.__crypto();
            }
        }else{
            this.__crypto();
        }
        this.privateKey = this.__crypto.privateKey;
        this.publicKey = this.__crypto.publicKey;
    }
    connect(options, callback){
        var crypto = this.__crypto;
        var client = new require("net").Socket()
        var vserve = {
            callbacks: {},
            on: function (event, callback){
                this.callbacks[event] = callback
            }
        };
        var serverKey;
        var promise = new Promise(function(resolve, reject){
            client.connect(options, function(){
                client.on("data", function(chunk){
                    if(JSON.parse(chunk.toString())[0] == "__auth"){
                        serverKey = JSON.parse(chunk.toString())[1];
                        client.write(Buffer.from(JSON.stringify(["__auth", crypto.publicKey, Date.now()])));
                        vserve.emit = function(event, data){
                            if(emit != "__auth" || emit != "end"){
                                client.write(Buffer.from(JSON.stringify([event, crypto.encryptAndSign(serverKey, data), Date.now()])));
                            }
                        }
                        resolve()
                    }else{
                        if(vserve.callbacks[JSON.parse(chunk.toString())[0]]){
                            var forwarded = crypto.decryptedAndVerify(serverKey, JSON.parse(chunk.toString())[1]);
                            forwarded.sent = JSON.parse(chunk.toString())[2];
                            forwarded.recieved = Date.now();
                            vserve.callbacks[JSON.parse(chunk.toString())[0]](forwarded);
                        }
                    }
                });
            });
        })
        promise.then(function(){
            callback(vserve);
        });
    }
}