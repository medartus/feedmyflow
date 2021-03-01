const format = require('./format');
const MailProvider = require('./mailProvider');
const LinkedinApi = require('./linkedinApi');
const { admin } = require('../provider/firebase');

const db = admin.firestore();
const bucket = admin.storage().bucket();

const postOnLinkedin = (newPost) => new Promise(async(resolve,reject) => {
    const userUid = newPost.data().userUID;

    const body = await format.postBody(userUid,newPost.data());
    if(body === null) return reject(new Error('Cannot build body'));

    if(userUid === "linkedin:3A8ySOLYhe" || process.env.GCLOUD_PROJECT === "feedmyflow"){

        const accessTokenDoc = await db.collection("user").doc(userUid).collection("adminData").doc("linkedin").get();
        if (!accessTokenDoc.exists) return reject(new Error('Token does not exist.'));

        let error;
        const linkedinApi = new LinkedinApi(accessTokenDoc.data().accessToken);
        await linkedinApi.postData(body).catch((err)=> error=err)
        if (error) return reject(error);
        
        if(process.env.GCLOUD_PROJECT === "feedmyflow" || true) {
            db.collection('user').doc(userUid).collection('post').doc(newPost.id).delete()
            const { media } = newPost.data();
            if(media && media.filePath ) bucket.file(media.filePath).delete();
        }
        
        const mailProvider = new MailProvider()
        await mailProvider.sendPostConfirmation(newPost.data())
            .then(()=> resolve('Sended'))
            .catch((error)=> reject(error));
    }
    return reject(new Error(`Can't post the data for this user: ${userUid}`));
});
 
module.exports = { postOnLinkedin };