const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.mail.ru',
    port: 465,
    secure: true,
    auth: {
        user: 'fanya.korovin@mail.ru',
        pass: 'gosplv3320012'
    }
});

module.exports = transporter;