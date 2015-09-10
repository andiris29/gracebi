var mail = require('../utils/mail');

var _db;

var startup = function(db, registService) {
    _db = db;

    /**
     * Update customer with top info
     */
    registService('post', '/customer/fromTOP', function(request, response) {
        var oauth = null;
        try {
            oauth = JSON.parse(request.body.oauth);
        } catch(error) {
            return;
        }

        if (oauth && !oauth.error && oauth.taobao_user_id) {
            var collection = _db.collection('customers');

            collection.update({
                'topUserID' : oauth.taobao_user_id
            }, {
                '$setOnInsert' : {
                    'create' : new Date()
                },
                '$set' : {
                    'topUserID' : oauth.taobao_user_id,
                    'topUserNick' : oauth.taobao_user_nick,
                    'topAccessToken' : oauth.access_token,
                    'topOAuthInfo' : oauth,
                    'update' : new Date()
                }
            }, {
                'upsert' : true
            }, function(error, numUpdated, result) {
                if (error) {
                    throw error;
                }
                var prefix = 'Customer ';
                if (result.updatedExisting) {
                    prefix += 'updated';
                } else {
                    prefix += 'created';
                }
                var subject = prefix + ': ' + oauth.taobao_user_nick;
                var message = 'access_token: ' + oauth.access_token;
                message += '\n' + 'refresh_token: ' + oauth.refresh_token;
                message += '\n' + 'taobao_user_id: ' + oauth.taobao_user_id;
                message += '\n' + 'taobao_user_nick: ' + oauth.taobao_user_nick;
                message += '\n' + 'r1_expires_in: ' + _parseExpire(oauth.r1_expires_in);
                message += '\n' + 'r2_expires_in: ' + _parseExpire(oauth.r2_expires_in);
                mail.notify(subject, message);
            });
        }
        response.send(null);
    });

};

var _parseExpire = function(expire) {
    if (isNaN(expire)) {
        return '';
    } else {
        expire = Number(expire);
        var d = Math.floor(expire / 3600 / 24 * 100) / 100;
        var h = Math.floor(expire / 3600);
        return d + '天 (' + h + '小时)';
    }
};

module.exports = {
    'startup' : startup
};
