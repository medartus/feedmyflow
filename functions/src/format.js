const { uploadMediaLinkedin } = require('./uploadMedia');

const mediaArticle = (data) => {
  const { description, originalUrl, title } = data.media;
  let mediaObject = {
    "status": "READY",
    "originalUrl": originalUrl,
    "title": {
      "text": title
    }
  }
  if(description !== undefined) {
    mediaObject['description'] = {};
    mediaObject['description']['text'] = description;
  }
  return mediaObject;
}

const mediaContent = async (userUid,data) => {
  const digitalmediaAsset = await uploadMediaLinkedin(userUid,data);
  return mediaObject = {
    "status": "READY",
    "media": digitalmediaAsset,
  };
}


const postMediaArray = async (userUid,data) => {
  let mediaArray = null;
  const { shareMediaCategory, media } = data;
  if(shareMediaCategory !== null && media !== null){
    if (shareMediaCategory === "ARTICLE") mediaArray=[mediaArticle(data)]
    if (shareMediaCategory === "IMAGE") mediaArray=[await mediaContent(userUid,data)]
    if (shareMediaCategory === "VIDEO") mediaArray=[await mediaContent(userUid,data)]
  }
  return mediaArray;
}

const postBody = async (userUid,data) => {
  let body = null;
  const { author, visibility, shareCommentary, shareMediaCategory } = data;
  if(author!==null && visibility!==null && shareCommentary!==null && shareMediaCategory!==null){
    body = {
      "author": author,
      "lifecycleState": "PUBLISHED",
      "specificContent": {
          "com.linkedin.ugc.ShareContent": {
              "shareCommentary": {
                "text": shareCommentary
              },
              "shareMediaCategory": shareMediaCategory
          }
      },
      "visibility": {
          "com.linkedin.ugc.MemberNetworkVisibility": visibility
      }
    }
    
    const mediaArray = await postMediaArray(userUid,data);
    if(mediaArray !== null){
      body.specificContent["com.linkedin.ugc.ShareContent"].media = mediaArray;
    }
  }
  return body;
}

module.exports = { postBody }