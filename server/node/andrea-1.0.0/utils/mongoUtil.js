var _ = require('underscore');
var async = require('async');
var mongo = require('mongodb');

var mongoUtil = {};
/**
 * findRef
 */
var findRef = mongoUtil.findRef = function(db, dbRef, callback) {
    var collection = db.collection(dbRef.namespace);
    collection.findOne({
        '_id' : dbRef.oid
    }, function(error, doc) {
        callback(error, doc);
    });
};

/**
 * semantic
 */
var semantic = mongoUtil.semantic = function(db, object, callback) {
    var tasks = [];

    var _genRecursiveTask = function(object) {
        return function(callback) {
            semantic(db, object, function() {
                callback(null);
            });
        };
    };
    var _genDBRefTask = function(owner, keyword, dbRef) {
        return function(callback) {
            findRef(db, dbRef, function(error, doc) {
                owner[keyword] = doc;
                callback(null);
            });
        };
    };

    _.each(object, function(value, keyword) {
        if ( value instanceof Date) {
            object[keyword] = value.getTime();
        } else if ( value instanceof mongo.DBRef) {
            tasks.push(_genDBRefTask(object, keyword, value));
        } else if (_.isArray(value) || _.isObject(value)) {
            tasks.push(_genRecursiveTask(value));
        }
    });

    async.parallel(tasks, function(error, results) {
        callback(object);
    });
};
/**
 * queryOne
 */
var queryOne = mongoUtil.queryOne = function(db, collection, criteria, options, callback) {
    _query(db, collection, 'findOne', criteria, options, callback);
};
/**
 * queryAll
 */
var queryAll = mongoUtil.queryAll = function(db, collection, criteria, options, callback) {
    _query(db, collection, 'find', criteria, options, callback);
};

/**
 * mapCollection
 */
var mapCollection = mongoUtil.mapCollection = function(collection, criteria, callback) {
    var map = {};
    collection.find(criteria).toArray(function(error, documents) {
        _.each(documents, function(document) {
            map[document._id.toString()] = document;
        });
        callback(map);
    });
};

var _query = function(db, collection, fn, criteria, options, callback) {
    // Prepare parameters
    if (_.isString(collection)) {
        collection = db.collection(collection);
    }
    criteria = criteria || {};
    if (criteria._id && _.isString(criteria._id)) {
        criteria._id = new mongo.ObjectID(criteria._id);
    }
    if (_.isFunction(options)) {
        callback = options;
        options = null;
    }
    options = options || {};
    //
    collection[fn](criteria, options, function(error, result) {
        var after = function(result) {
            mongoUtil.semantic(db, result, function(result) {
                callback(result);
            });
        };
        if (fn === 'find') {
            result.toArray(function(error, result) {
                after(result);
            });
        } else {
            after(result);
        }
    });
};

module.exports = mongoUtil;
