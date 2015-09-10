var _ = require('underscore');
var _db;
var http = require('http');
var https = require('https');

var startup = function(db, registService) {
    _db = db;

    // TODO Can't work under https
    registService('get', '/jd/oauth/token', function(request, response) {
        if (request.query && request.query.client_id) {
            var appKey = request.query.client_id;
            var env = _getEnv(appKey);
            var queries = [];
            queries.push('grant_type=authorization_code');
            queries.push('scope=read');
            queries.push('client_id=' + appKey);
            queries.push('redirect_uri=' + encodeURIComponent(request.query.redirect_uri));
            queries.push('code=' + request.query.code);
            queries.push('state=' + request.query.state);
            queries.push('client_secret=' + env.secret);

            var httpRequest = env.http.request({
                'hostname' : env.host,
                'port' : '80',
                'path' : '/oauth/token?' + queries.join('&'),
                'method' : 'POST'
            }, function(httpResponse) {
                httpResponse.setEncoding('utf8');
                httpResponse.on('data', function(data) {
                    response.set('Content-Type', 'text/plain');
                    response.send(request.query.callback + '(' + data + ');');
                    response.end();
                });
            });

            httpRequest.on('error', function(error) {
                console.log('problem with request: ' + error.message);
            });
            httpRequest.end();
        } else {
            response.end();
        }
    });
    registService('get', '/jd/user/create', function(request, response) {
        if (request.query && request.query.app_key && request.query.access_token) {

            var collection = _db.collection('jdUser');
            collection.update({
                'app_key' : request.query.app_key,
                'access_token' : request.query.access_token
            }, {
                'app_key' : request.query.app_key,
                'access_token' : request.query.access_token,
                'user_id' : request.query.user_id
            }, {
                'upsert' : true
            }, function(error) {
                if (error) {
                    throw error;
                }
            });
        }
        response.end();
    });
};

var _getEnv = function(appKey) {
    if (appKey === '52DAB8C615274D63570E146A20B7646E') {
        // Sandbox
        return {
            'type' : 'sandbox',
            'secret' : '2dbc011153054b4eb0f47cefbb76fe44',
            'host' : 'auth.sandbox.360buy.com',
            'http' : http
        };
    } else if (appKey === 'E5D584C2CC4F6F92DDF43959EEA6CC45') {
        // Production
        return {
            'type' : 'production',
            'secret' : '63bd6be1394246b49a2339f5939c0935',
            'host' : 'auth.360buy.com',
            'http' : https
        };
    }
};

module.exports = {
    'startup' : startup
};
