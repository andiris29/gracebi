var crypto = require('crypto');

var cryptoUtil = module.exports = {};

var encrypt = cryptoUtil.encrypt = function(string, secret) {
    var cipher = crypto.createCipher('aes192', secret);
    var enc = cipher.update(string, 'utf8', 'hex');
    enc += cipher.final('hex');
    return enc;
};

var decrypt = cryptoUtil.decrypt = function(string, secret) {
    var decipher = crypto.createDecipher('aes192', secret);
    var dec = decipher.update(string, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
};
