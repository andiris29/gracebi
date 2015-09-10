var _ = require('underscore');
var mongo = require('mongodb');
var async = require('async');
var genSN = require('../utils/genSN');
var zipResponse = require('../utils/zipResponse');
var jsonp = require('../utils/jsonp');

var startup = function(db, registService) {
    registService('post', '/collaboration/create', function(request, response) {
        var collection = db.collection('collaborations');
        genSN.genUniq(collection, 6, function(sn) {
            var document = {
                'sn' : sn,
                'create' : new Date()
            };
            _.extend(document, JSON.parse(request.body.collaboration));
            collection.insert(document, function(error) {
                var payload = {
                    'sn' : sn
                };
                if (error) {
                    payload.error = error;
                }
                response.json(payload);
            });
        });
    });
    registService('get', '/collaboration/get', function(request, response) {
        var collection = db.collection('collaborations');
        collection.findOne({
            'sn' : request.query.sn
        }, function(error, collaboration) {
            var payload = {
                'collaboration' : collaboration
            };
            if (error) {
                payload.error = error;
            }

            response.set('Content-Type', 'text/plain');
            zipResponse.write(jsonp.wrap(payload, request.query.callback), request, response, function(error) {
                response.end();
            });
        });
    });
};

module.exports = {
    'startup' : startup
};
