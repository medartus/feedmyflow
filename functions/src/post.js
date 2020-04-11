const format = require('./format');
const MailProvider = require('./mailProvider');
const LinkedinApi = require('./linkedinApi');
const { admin } = require('../provider/firebase');

const db = admin.firestore();

const postOnLinkedin = async (res, newPost) => {
    const body = format.generateBodyContent(newPost.data());
    if(body === null){
    throw new Error('Cannot build body');
    }

    const userUid = newPost.data().userUID

    if(userUid === "linkedin:hV1NxWo7fQ" || process.env.GCLOUD_PROJECT === "feedmyflow"){

        const accessTokenDoc = await db.collection("user").doc(userUid).collection("adminData").doc("linkedin").get();
        if (!accessTokenDoc.exists) {
            throw new Error('Token does not exist.');
        }
        let result,error;

        const linkedinApi = new LinkedinApi(accessTokenDoc.data().accessToken);
        await linkedinApi.postData(body)
            .then((res)=> result = res)
            .catch((err)=>error = err)
        
        if(error !== undefined) {
            res.json({ error: error });
        } else {
            // db.collection('user').doc(userUid).collection('post').doc(newPost.id).delete()
            
            const mailProvider = new MailProvider()
            mailProvider.sendPostConfirmation(userUid)
                .then(()=> {return res.send('Sended')})
                .catch((error)=> {return res.send(error.toString())});
        }
    }
}
 
module.exports = { postOnLinkedin };