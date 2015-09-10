var zlib = require('zlib');
var cryptoUtil = global.andrea.require('/utils/cryptoUtil');

var httpUtil = module.exports = {};

var json = httpUtil.json = function(req, res, json) {
    if (req.query.callback) {
        res.jsonp(json);
    } else {
        res.json(json);
    }
};

var writeSession = httpUtil.writeSession = function(req, key, value) {
    var string = JSON.stringify(value);
    req.session[key] = cryptoUtil.encrypt(string, 'millionaire');
};

var readSession = httpUtil.readSession = function(req, key) {
    var string = req.session[key];
    if (string) {
        string = cryptoUtil.decrypt(string, 'millionaire');
        return JSON.parse(string);
    } else {
        return null;
    }
};

var zipResponse = httpUtil.zipResponse = function(payload, req, res, callback) {
    var acceptEncoding = req.headers['accept-encoding'];
    if (!acceptEncoding) {
        acceptEncoding = '';
    }
    if (acceptEncoding.match(/\bdeflate\b/)) {
        res.writeHead(200, {
            'content-encoding' : 'deflate'
        });
        zlib.deflate(payload, function(error, result) {
            if (!error) {
                res.end(result);
            }
            callback(error);
        });
    } else if (acceptEncoding.match(/\bgzip\b/)) {
        res.writeHead(200, {
            'content-encoding' : 'gzip'
        });
        zlib.gzip(payload, function(error, result) {
            if (!error) {
                res.end(result);
            }
            callback(error);
        });
    } else {
        res.writeHead(200, {});
        res.end(payload);
        callback(null);
    }
};

