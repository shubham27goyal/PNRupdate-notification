var nodemailer = require('nodemailer'),
emailConfig = JSON.parse(require('fs').readFileSync("./config/email.json"));

// Simple Mail application
module.exports = function(to, subject, message, callback)
{
    nodemailer.createTransport('SMTP', {
        service: 'Gmail',
        auth: {
            user: emailConfig.email,
            pass: emailConfig.pass
        }
    })
    .sendMail({
        from: 'dustyRacks' + ' &lt;' + emailConfig.email  + '&gt;',
        to: to,
        subject: subject,
        text: message
    }, function (error, res) 
    {
        if(!error)
        {
            callback(null);
        }
        else 
        {
            callback(error);
        }
    });
};