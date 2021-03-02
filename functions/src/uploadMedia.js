const request = require("request");
const getRawBody = require('raw-body');

const LinkedinApi = require('./linkedinApi');
const { admin } = require('../provider/firebase');

const db = admin.firestore();
const bucket = admin.storage().bucket();

const registerContentBody = (shareMediaCategory,author) => {
  const body = {
    "registerUploadRequest": {
      "owner": author,
      "serviceRelationships": [
        {
          "identifier": "urn:li:userGeneratedContent",
          "relationshipType": "OWNER"
        }
      ]
    }
  }
  if(shareMediaCategory === "IMAGE"){
    body.registerUploadRequest.supportedUploadMechanism = ["SYNCHRONOUS_UPLOAD"]
    body.registerUploadRequest.recipes = ["urn:li:digitalmediaRecipe:feedshare-image"]
  }
  else if(shareMediaCategory === "VIDEO"){
    body.registerUploadRequest.recipes = ["urn:li:digitalmediaRecipe:feedshare-video"]
  }
  else{
    console.log("Media Category not supported");
  }
  return body;
}

const uploadMediaLinkedin = async (userUid,data) => {
  const { shareMediaCategory, author, media} = data;
  const { fileInfo } = media;
    
    const linkedinApi = new LinkedinApi();
    await linkedinApi.retrieveAccessToken(userUid);
    
    const body = registerContentBody(shareMediaCategory,author);

    let error;
    const registerResponse = await linkedinApi.request("LINKEDIN_API_REGISTER_UPLOAD",{body}).catch((err)=> error = err)
    if (error) return error;
    const { asset, uploadMechanism } = registerResponse.value;
    const { uploadUrl } = uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'];

    const accessToken = linkedinApi.getAccessToken();
    let headersUpload
    if(shareMediaCategory === "IMAGE") headersUpload = { 'Authorization' : `Bearer ${accessToken}` };
    if(shareMediaCategory === "VIDEO") headersUpload = { "Content-Type" : "application/octet-stream" };
    await new Promise( async (resolve,reject) => {
      const stream = bucket.file(fileInfo.filePath).createReadStream();
      const buffer = await getRawBody(stream);
      request.put({ url: uploadUrl, headers: headersUpload, body: buffer }, (err, httpResponse) => {
        if (err) reject(err);
        resolve();
        // console.log(httpResponse.statusCode);
        // console.log(httpResponse.toJSON());
    })
    console.log(asset)
  })
  return asset;
};

module.exports = { uploadMediaLinkedin };