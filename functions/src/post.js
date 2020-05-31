const format = require('./format');
const MailProvider = require('./mailProvider');
const LinkedinApi = require('./linkedinApi');
const { admin } = require('../provider/firebase');

const db = admin.firestore();

const postOnLinkedin = (newPost) => new Promise(async(resolve,reject) => {
    const body = format.generateBodyContent(newPost.data());
    if(body === null) return reject(new Error('Cannot build body'));

    const userUid = newPost.data().userUID

    if(userUid === "linkedin:3A8ySOLYhe" || process.env.GCLOUD_PROJECT === "feedmyflow"){

        const accessTokenDoc = await db.collection("user").doc(userUid).collection("adminData").doc("linkedin").get();
        if (!accessTokenDoc.exists) return reject(new Error('Token does not exist.'));

        let error;
        const linkedinApi = new LinkedinApi(accessTokenDoc.data().accessToken);
        await linkedinApi.postData(body).catch((err)=> error=err)
        if (error) return reject(error);
        
        if(process.env.GCLOUD_PROJECT === "feedmyflow") {
            db.collection('user').doc(userUid).collection('post').doc(newPost.id).delete()
        }
        
        const mailProvider = new MailProvider()
        await mailProvider.sendPostConfirmation(newPost.data())
            .then(()=> resolve('Sended'))
            .catch((error)=> reject(error));
        return null;
    }
});
 
module.exports = { postOnLinkedin };