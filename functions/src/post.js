const format = require('./format');
const MailProvider = require('./mailProvider');
const LinkedinApi = require('./linkedinApi');
const { admin } = require('../provider/firebase');

const db = admin.firestore();
const bucket = admin.storage().bucket();

const trackData = async (userUid,data) => {
    const {author, shareMediaCategory } = data;
    const increaseValue = admin.firestore.FieldValue.increment(1);
    const increaseObject = { };

    if(author.split(':')[2] === "person") increaseObject['numPersonalPost'] = increaseValue;
    else if(author.split(':')[2] === "organization") increaseObject['numCompanyPost'] = increaseValue;
    else increaseObject['numOhterAuthorPost'] = increaseValue;

    if(shareMediaCategory === "ARTICLE") increaseObject['numArticlePost'] = increaseValue;
    else if(shareMediaCategory === "IMAGE") increaseObject['numImagePost'] = increaseValue;
    else increaseObject['numOhterMediaPost'] = increaseValue;

    increaseObject['numTotalPost'] = increaseValue;
    const userRef = db.collection('user').doc(userUid);
    const docSnapshot = await userRef.get();

    if (docSnapshot.exists) userRef.update(increaseObject);
    else userRef.set(increaseObject);
}

const postOnLinkedin = (newPost) => new Promise(async(resolve,reject) => {
    const userUid = newPost.data().userUID;

    const body = await format.postBody(userUid,newPost.data());
    if(body === null) return reject(new Error('Cannot build body'));

    if(userUid === "linkedin:3A8ySOLYhe" || process.env.GCLOUD_PROJECT === "feedmyflow"){

        const linkedinApi = new LinkedinApi();
        await linkedinApi.retrieveAccessToken(userUid);
        const res = await linkedinApi.request("LINKEDIN_API_ROLE_UGC_POST",{body}).catch((err)=> reject(err));

        if(process.env.GCLOUD_PROJECT === "feedmyflow") {
            if(res !== undefined && res.id){
                trackData(userUid, newPost.data())

                db.collection('user').doc(userUid).collection('posted').doc(newPost.id).set({...newPost.data(),...{urnPostId:res.id}});
                db.collection('user').doc(userUid).collection('post').doc(newPost.id).delete();

                const { media } = newPost.data();
                if(media && media.fileInfo && media.fileInfo.filePath) bucket.file(media.fileInfo.filePath).delete();
                            
                const mailProvider = new MailProvider()
                await mailProvider.sendPostConfirmation(newPost.data())
                .then(()=> resolve('Sended'))
                .catch((error)=> reject(error));
            }
        }
    }
    return reject(new Error(`Can't post the data for this user: ${userUid}`));
});

module.exports = { trackData, postOnLinkedin };