const request = require("request");

const LinkedinApi = require('./linkedinApi');
const { admin } = require('../provider/firebase');

const db = admin.firestore();
const bucket = admin.storage().bucket();

const registerImageBody = (userUid) => {
  const personUid = userUid.split(":")[1];
  let body = {
    "registerUploadRequest": {
      "owner": `urn:li:person:${personUid}`,
      "recipes": [
        "urn:li:digitalmediaRecipe:feedshare-image"
      ],
      "serviceRelationships": [
        {
          "identifier": "urn:li:userGeneratedContent",
          "relationshipType": "OWNER"
        }
      ],
      "supportedUploadMechanism":[
        "SYNCHRONOUS_UPLOAD"
      ]
    }
  }
  return body;
}

const uploadImageLinkedin = async (filePath,userUid) => {

    const body = registerImageBody(userUid);
    const accessTokenDoc = await db.collection("user").doc(userUid).collection("adminData").doc("linkedin").get();
    const { accessToken } = accessTokenDoc.data();
    const linkedinApi = new LinkedinApi(accessToken);

    let error;
    const headersRegister = { 'Content-Type': 'application/json' };
    const registerResponse = await linkedinApi.registerImage(body,headersRegister).catch((err)=> error = err)
    if (error) return error;
    const { asset, uploadMechanism } = registerResponse.value;
    const { uploadUrl } = uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'];

    const headersUpload = {'Authorization': `Bearer ${accessToken}`};
    bucket.file(filePath).createReadStream().pipe(request.put({url: uploadUrl, headers: headersUpload}))

    return asset;
    // return db.collection('user').doc(userUid).collection('post').doc(postId).update({
    //     shareMediaCategory: "IMAGE",
    //     media : {
    //         digitalmediaAsset: asset,
    //         filePath,
    //     }
    // })
    // .then(() => {
    //     return "Document successfully written!";
    // })
    // .catch((error) => {
    //     return error;
    // });
};

module.exports = { uploadImageLinkedin };