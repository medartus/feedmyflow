const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');
const juice = require('juice')

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

        return juice(html)
    }

    sendPostConfirmation(data){
        const {userUID,shareCommentary} = data;
        return new Promise(async (resolve,reject) => {
            const {email,displayName} = await admin.auth().getUser(userUID)
                .then((userRecord) => {return userRecord})
                .catch((err)=>reject(err));
            if (email !== undefined){

                const html = this.getEmailTemplate("postConfirmation",{displayName,shareCommentary})
                const mailOptions = {
                    from: 'feedmyflow@gmail.com', // Something like: Jane Doe <janedoe@gmail.com>
                    to: "nico.caill@live.fr",
                    subject: `FeedMyFlow post confirmation ${email}`, // email subject
                    html,
                    attachments: [{
                        path: './emailTemplates/fmf.PNG',
                        cid: 'fmfLogo' //same cid value as in the html img src
                    }]
                };
                this.sendEmail(mailOptions)
                    .then((res)=>resolve(res))
                    .catch((err)=>reject(err))
            }
        });
    }

    sendWelcomeEmail(email,displayName){
        return new Promise(async (resolve,reject) => {

            const html = this.getEmailTemplate("welcome",{displayName})
            const mailOptions = {
                from: 'feedmyflow@gmail.com', // Something like: Jane Doe <janedoe@gmail.com>
                to: email,
                subject: 'Weclome on FeedMyFlow !', // email subject
                html,
                attachments: [{
                    path: './emailTemplates/fmf.PNG',
                    cid: 'fmfLogo' //same cid value as in the html img src
                }]
            };
            this.sendEmail(mailOptions)
                .then((res)=>resolve(res))
                .catch((err)=>reject(err))
        });
    }

    
}

module.exports = MailProvider;