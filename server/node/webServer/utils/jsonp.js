var wrap = function(json, callback) {
    if (callback) {
        return callback + '(' + JSON.stringify(json) + ');';
    } else {
        return JSON.stringify(json);
    }
};

module.exports = {
    'wrap' : wrap
};
