var _ = require('underscore');
var http = require('http');

var ipUtil = module.exports = {};

var FAILED = ipUtil.FAILED = {
    'format' : 'failed'
};
// http://api.map.baidu.com/location/ip?ak=LUl7FhYtgAnGyDXHxRTz6Iui&ip=180.173.85.255
var queryBaidu = ipUtil.queryBaidu = function(ip, callback) {
    var request = http.request({
        'hostname' : 'api.map.baidu.com',
        'path' : '/location/ip?ak=LUl7FhYtgAnGyDXHxRTz6Iui&ip=' + ip,
        'method' : 'GET'
    }, function(response) {
        response.setEncoding('utf8');
        var data = '';
        response.on('data', function(trunk) {
            data += trunk;
        });
        response.on('end', function() {
            ipInfo = _decodeBaiduResponse(data);
            if (ipInfo && !ipInfo.content) {
                ipInfo = null;
            }
            callback( ipInfo ? {
                'format' : 'baidu',
                'location' : ipInfo
            } : null);
        });
    });
    request.on('error', function(error) {
        callback(null);
    });
    request.end();
};
// http://freegeoip.net/json/180.173.85.255
var queryFreegeoip = ipUtil.queryFreegeoip = function(ip, callback) {
    var request = http.request({
        'hostname' : 'freegeoip.net',
        'path' : '/json/' + ip,
        'method' : 'GET'
    }, function(response) {
        response.setEncoding('utf8');
        response.on('data', function(ipInfo) {
            try {
                ipInfo = JSON.parse(ipInfo);
            } catch(error) {
                ipInfo = null;
            }
            callback( ipInfo ? {
                'format' : 'freegeoip',
                'location' : ipInfo
            } : null);
        });
    });
    request.on('error', function(error) {
        callback(null);
    });
    request.end();
};

var _decodeBaiduResponse = function(x) {
    var r = /\\u([\d\w]{4})/gi;
    x = x.replace(r, function(match, grp) {
        return String.fromCharCode(parseInt(grp, 16));
    });
    x = unescape(x);
    try {
        return JSON.parse(x);
    } catch(error) {
        return null;
    }
};

