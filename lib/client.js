module.exports = class{
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
    }
    connect(options, callback){
        var crypto = this.__crypto;
        var publicKey = this.publicKey;
        var untilauth = new Promise(function(resolve){
            const client = new require("net").Socket();
            client.connect(options, function(){
                client.write(Buffer.from(publicKey));
                var vserve = {
                    callbacks: {},
                    on: function(event, callback){
                        this.callbacks[event] = callback;
                    }
                };
                var serverKey;
                var serverReady = false;
                client.on("data", function(chunk){
                    console.log(Boolean(serverKey), serverReady);
                    console.log(chunk.toString());
                    if(!serverKey || !serverReady){
                        if(chunk.toString() == "ready"){
                            serverReady = true;
                        }else{
                            serverKey = chunk.toString();
                            client.write(Buffer.from("ready"));
                            vserve.emit = function(event, data){
                                if(event == "end"){
                                    throw "Illegal event: end"
                                }
                                client.write(Buffer.from(JSON.stringify([event, crypto.encryptAndSign(serverKey, data), Date.now()])));
                            }
                        }
                        if(serverReady && serverKey) resolve(vserve);
                    }else{
                        var data = JSON.parse(chunk.toString());
                        if(vserve["callbacks"][data[0]]){
                            var forwarded = crypto.decryptedAndVerify(serverKey, data[1]);
                            forwarded.sent = data[2];
                            forwarded.recieved = Date.now();
                            vserve["callbacks"][data[0]](forwarded);
                        }
                    }
                });
            });
        });
        untilauth.then(callback);
    }
}