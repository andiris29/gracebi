var zlib = require('zlib');

var write = function(payload, request, response, callback) {
    var acceptEncoding = request.headers['accept-encoding'];
    if (!acceptEncoding) {
        acceptEncoding = '';
    }
    if (acceptEncoding.match(/\bdeflate\b/)) {
        response.writeHead(200, {
            'content-encoding' : 'deflate'
        });
        zlib.deflate(payload, function(error, result) {
            if (!error) {
                response.write(result);
            }
            callback(error);
        });
    } else if (acceptEncoding.match(/\bgzip\b/)) {
        response.writeHead(200, {
            'content-encoding' : 'gzip'
        });
        zlib.gzip(payload, function(error, result) {
            if (!error) {
                response.write(result);
            }
            callback(error);
        });
    } else {
        response.writeHead(200, {});
        response.write(payload);
        callback(null);
    }
};

module.exports = {
    'write' : write
};
