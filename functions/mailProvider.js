const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');

const fs = require("fs")

class MailProvider {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'feedmyflow@gmail.com',
                pass: "whpelydbgggprubb",
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

    getEmailTemplate(templateName,context){
        let html = fs.readFileSync(`./emailTemplates/${templateName}.html`,'utf8')

        Object.keys(context).forEach(key => {
            html = html.replace(`{{${key}}}`,context[key]);
        });  

        return html
    }

    sendPostConfirmation(userUid){
        return new Promise(async (resolve,reject) => {
            const email = await admin.auth().getUser(userUid)
                .then((userRecord) => {return userRecord.email})
                .catch((err)=>reject(err));
            if (email !== undefined){

                const html = this.get("postConfirmation",{})
                const mailOptions = {
                    from: 'feedmyflow@gmail.com', // Something like: Jane Doe <janedoe@gmail.com>
                    to: email,
                    subject: 'I\'M A PICKLE!!!', // email subject
                    html
                    };
                this.sendEmail(mailOptions)
                    .then((res)=>resolve(res))
                    .catch((err)=>reject(err))
            }
        });
    }

    sendWelcomeEmail(email){
        return new Promise(async (resolve,reject) => {

            const html = this.getEmailTemplate("welcome",{name:"Dear pickle"})
            const mailOptions = {
                from: 'feedmyflow@gmail.com', // Something like: Jane Doe <janedoe@gmail.com>
                to: email,
                subject: 'Weclome on FeedMyFlow !', // email subject
                html
                };
            this.sendEmail(mailOptions)
                .then((res)=>resolve(res))
                .catch((err)=>reject(err))
        });
    }

    
}

module.exports = MailProvider;