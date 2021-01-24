const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');
const juice = require('juice')

const fs = require("fs")

const emailAddress = `Feed My Flow <${functions.config().email.address}>`;

class MailProvider {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: functions.config().email.address,
                pass: functions.config().email.password,
            }
        });
    }

    sendEmail(mailOptions){
        return new Promise((resolve, reject) => {
            this.transporter.sendMail(mailOptions, (error, info) => {
                if(error) reject(error);
                else resolve(info);
            });
        });
    }

    getEmailTemplate(templateName, context = undefined){
        let html = fs.readFileSync(`./emailTemplates/${templateName}.html`,'utf8')

        if(context){
            Object.keys(context).forEach(key => {
                const regex = new RegExp(`{{${key}}}`,"g")
                html = html.replace(regex,context[key]);
            });  
        }

        return juice(html);
    }

    createMailOptions(template, params, email, subject){
        const html = this.getEmailTemplate(template, params)
        return {
            from: emailAddress,
            to: email,
            subject,
            html,
            attachments: [{
                path: './emailTemplates/fmf.PNG',
                cid: 'fmfLogo'
            }]
        };
    }

    sendPostConfirmation(data){
        const { userUID, shareCommentary } = data;
        return new Promise(async (resolve,reject) => {
            const { email, displayName, photoURL } = await admin.auth().getUser(userUID)
                .then((userRecord) => { return userRecord })
                .catch((err) => reject(err));
            if (email !== undefined){
                const params = { displayName, shareCommentary, photoURL };
                const mailOptions = this.createMailOptions("postConfirmation", params, email, 'FeedMyFlow post confirmation')
                this.sendEmail(mailOptions)
                    .then((res) => resolve(res))
                    .catch((err) => reject(err))
            }
            else{
                console.log(`No email for user ${userUID}`)
            }
        });
    }

    sendWelcomeEmail(email, displayName){
        return new Promise(async (resolve, reject) => {
            const mailOptions = this.createMailOptions("welcome", { displayName }, email, 'Weclome on FeedMyFlow !')
            this.sendEmail(mailOptions)
                .then((res) => resolve(res))
                .catch((err) => reject(err))
        });
    }

    
}

module.exports = MailProvider;