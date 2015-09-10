// Parse arguments
var args = {};
process.argv.forEach(function(kv, index, array) {
    var sp = kv.split('=');
    var key = sp[0];
    var value = sp[sp.length - 1];
    args[key] = value;
});

// Global
global.andrea = {
    'require' : function(id) {
        return require('./andrea-1.0.0' + id);
    },
    'args' : args
};

// Hack http for proxy
var http = require('http');
http.nativeRequest = http.request;
http.request = function(options, callback) {
    if (args.proxyHost && args.proxyPort) {
        var nativeHost = options.hostname;
        delete options.hostname;
        options.host = args.proxyHost;
        options.port = args.proxyPort;
        options.path = 'http://' + nativeHost + options.path;
        if (!options.headers) {
            options.headers = {};
        }
        options.headers.host = nativeHost;
    }
    return http.nativeRequest(options, callback);
};

var grace = global.grace = module.exports = {
    'init' : function(callback) {
        var info = {
            'domain' : '127.0.0.1',
            'port' : 30002,
            'db' : 'grace',
            'user' : 'andrea',
            'password' : 'andrea@mongo'
        };
        var mongodb = require('mongodb');
        var MongoClient = mongodb.MongoClient;
        MongoClient.connect('mongodb://' + info.domain + ':' + info.port + '/' + info.db, function(error, db) {
            if (error) {
                throw error;
            }

            db.authenticate(info.user, info.password, function(error, res) {
                if (error) {
                    throw error;
                } else {
                    callback(db);
                }
            });
        });
    }
};
