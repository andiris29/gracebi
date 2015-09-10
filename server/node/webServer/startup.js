var _ = require('underscore');
var express = require('express');
var mongo = require('mongodb');
var async = require('async');

async.parallel([
// Create DB connetion
function(callback) {
    var info = {
        'domain' : '127.0.0.1',
        'port' : 30002,
        'db' : 'grace',
        'user' : 'andrea',
        'password' : 'andrea@mongo'
    };

    var MongoClient = mongo.MongoClient;
    MongoClient.connect('mongodb://' + info.domain + ':' + info.port + '/' + info.db, function(error, db) {
        if (error) {
            throw error;
        }

        db.authenticate(info.user, info.password, function(error, res) {
            if (error) {
                throw error;
            } else {
                callback(null, db);
            }
        });
    });
},
// Create web server
function(callback) {
    var info = {
        'port' : 30001
    };

    var app = express();
    app.use(express.bodyParser());
    app.get('/crossdomain.xml', function(request, response) {
        response.set('Content-Type', 'application/xml');
        var xml = '<?xml version="1.0"?><cross-domain-policy><allow-access-from domain="*" /></cross-domain-policy>';
        response.send(xml);
        response.end();
    });
    app.listen(info.port);

    callback(null, app);
}], function(error, results) {
    var db = results[0];
    var app = results[1];

    var registService = function(method, path, callback) {
        var callbackWrapper = function(request, response) {
            // console.time(path);
            // Set header for cross domain
            response.header("Access-Control-Allow-Origin", "*");
            response.header("Access-Control-Allow-Headers", "X-Requested-With");
            // Run service
            callback.apply(this, arguments);
            // console.timeEnd(path);
        };

        if (method === 'get') {
            app.get('/andrea.graceBI/server' + path, callbackWrapper);
        } else if (method === 'post') {
            app.post('/andrea.graceBI/server' + path, callbackWrapper);
        }
    };

    require('./services/collaboration').startup(db, registService);
    require('./services/jd').startup(db, registService);

    console.log('startup complete!');
});

