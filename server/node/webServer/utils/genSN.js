var _ = require('underscore');

var gen = function(length) {
    // (10+26)^5 = 60,466,176
    var result = '';
    for (var i = 0; i < length; i++) {
        var random = _.random(0, 35);
        if (random < 10) {
            // 0-9
            result += String.fromCharCode(random + 48);
        } else {
            // a-z
            result += String.fromCharCode(random - 10 + 97);
        }
    }
    return result;
};

var genUniq = function(collection, length, callback) {
    var sn = gen(length);
    collection.find({
        'sn' : sn
    }).count(function(error, numDuplicateds) {
        if (numDuplicateds === 0) {
            callback(sn);
        } else {
            genUniq(collection, length, function(sn) {
                callback(sn);
            });
        }
    });
};

module.exports = {
    'gen' : gen,
    'genUniq' : genUniq
};
