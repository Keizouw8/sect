const { createSign, createVerify, publicEncrypt, privateDecrypt } = require("crypto");

module.exports = function(public, private){
    keys = require("./keypair.js");
    if(!public && !private){
        module.exports.publicKey = keys.publicKey;
        module.exports.privateKey = keys.privateKey;
    }
}

module.exports.encryptAndSign = function(publicKey, message){
    var encrypted = publicEncrypt(publicKey, Buffer.from(message));
    var signer = createSign("rsa-sha256");
    signer.update(message);
    var signature = signer.sign(module.exports.privateKey, 'hex');
    return {encrypted: encrypted, signature, signature}
}

module.exports.decryptedAndVerify = function(publicKey, message){
    var decrypted = privateDecrypt(module.exports.privateKey, Buffer.from(message.encrypted)).toString();
    var verifier = createVerify("rsa-sha256");

    verifier.update(decrypted);
    var verified = verifier.verify(publicKey, message.signature, 'hex');

    return {data: decrypted, verified: verified}
}