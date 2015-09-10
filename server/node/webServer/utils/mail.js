var _ = require('underscore');
var nodemailer = require('nodemailer');

var mail = module.exports = {};

var _smtpTransport = nodemailer.createTransport('SMTP', {
    'host' : 'smtp.qq.com',
    'port' : 465,
    'secureConnection' : true,
    'auth' : {
        'user' : '896815706@qq.com',
        'pass' : 'dde1f06933'
    }
});

var notify = mail.notify = function(subject, text) {
    var mailOptions = {
        'from' : '896815706@qq.com',
        'to' : 'andiris29@gmail.com',
        'cc' : '896815706@qq.com',
        'subject' : '[graceBI] ' + subject,
        'text' : text
    };
    _smtpTransport.sendMail(mailOptions, function(error, response) {
        if (error) {
            console.log(error);
        } else {
        }
    });
};

module.exports = {
    'notify' : notify
};
