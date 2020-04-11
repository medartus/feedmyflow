const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');

class MailProvider {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'feedmyflow@gmail.com',
                pass: functions.config().email.password,
            }
        });
    }

    sendEmail(mailOptions){
        return new Promise((resolve,reject) => {
            this.transporter.sendMail(mailOptions, (error, info) => {
                if(error) reject(error);
                else resolve(info);
            });
        });
    }

    sendPostConfirmation(userUid){
        return new Promise(async (resolve,reject) => {
            const email = await admin.auth().getUser(userUid)
                .then((userRecord) => {return userRecord.email})
                .catch((err)=>reject(err));
            if (email !== undefined){
                const mailOptions = {
                    from: 'feedmyflow@gmail.com', // Something like: Jane Doe <janedoe@gmail.com>
                    to: email,
                    subject: 'I\'M A PICKLE!!!', // email subject
                    html: `<p style="font-size: 16px;">Pickle Riiiiiiiiiiiiiiiick!!</p>
                        <br />
                        <img src="https://images.prod.meredith.com/product/fc8754735c8a9b4aebb786278e7265a5/1538025388228/l/rick-and-morty-pickle-rick-sticker" />
                    ` // email content in HTML
                    };
                this.sendEmail(mailOptions)
                    .then((res)=>resolve(res))
                    .catch((err)=>reject(err))
            }
        });
    }

    sendWelcomeEmail(email){
        return new Promise(async (resolve,reject) => {
            const mailOptions = {
                from: 'feedmyflow@gmail.com', // Something like: Jane Doe <janedoe@gmail.com>
                to: email,
                subject: 'WELCOME PICKLE!!!', // email subject
                html: `<p style="font-size: 16px;">WELCOOOOOOOOOME !!</p>
                    <br />
                    <img src="https://images.prod.meredith.com/product/fc8754735c8a9b4aebb786278e7265a5/1538025388228/l/rick-and-morty-pickle-rick-sticker" />
                ` // email content in HTML
                };
            this.sendEmail(mailOptions)
                .then((res)=>resolve(res))
                .catch((err)=>reject(err))
        });
    }
}

module.exports = MailProvider;