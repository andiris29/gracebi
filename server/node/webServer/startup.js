var grace = require('../grace');

var _ = require('underscore');
var express = require('express');
var mongo = require('mongodb');
var async = require('async');

async.parallel([
// Create DB connetion
function(callback) {
    grace.init(function(db) {
        callback(null, db);
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
    });
    app.listen(info.port);

    callback(null, app);
}], function(error, results) {
    var db = results[0];
    var app = results[1];

    var performanceThreshold = 1000;
    var registService = function(method, path, callback) {
        var callbackWrapper = function(request, response) {
            // Log begin time
            var begin = new Date().getTime();
            // Set header for cross domain
            response.header("Access-Control-Allow-Origin", "*");
            response.header("Access-Control-Allow-Headers", "X-Requested-With");
            // Run service
            try {
                callback.apply(this, arguments);
            } catch(error) {
                var mail = require('./utils/mail');
                var httpUtil = global.andrea.require('/utils/httpUtil');

                var subject = 'Service error occurred';
                var message = 'path: ' + path;
                message += '\n' + 'error: ' + error;
                if (error) {
                    message += '\n' + 'stack: ' + error.stack;
                }
                mail.notify(subject, message);

                httpUtil.json(request, response, {
                    'error' : error
                });
            }
            // Log end time
            var timeCost = new Date().getTime() - begin;
            if (timeCost > performanceThreshold) {
                console.warn('timeCost(>' + performanceThreshold + '): ' + timeCost + ', path: ' + path);
            }
        };

        if (method === 'get') {
            app.get(path, callbackWrapper);
        } else if (method === 'post') {
            app.post(path, callbackWrapper);
        }
    };

    require('./services/collaboration').startup(db, registService);
    require('./services/customer').startup(db, registService);
    require('./services/jd').startup(db, registService);

    console.log('startup complete!');
});

