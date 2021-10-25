const fetch = require('node-fetch');

const { uploadMediaLinkedin } = require('./uploadMedia');

const mediaArticle = (data) => {
  const { description, originalUrl, title, thumbnail } = data.media;
  let mediaObject = {
    "status": "READY",
    "originalUrl": originalUrl,
    "title": {
      "text": title
    }
  }
  if(thumbnail !== undefined && thumbnail !== null) {
    mediaObject['thumbnails'] = [];
    mediaObject['thumbnails'].push({ "url": thumbnail });
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

const getThumbnail = async (data) => {
  const { originalUrl } = data.media;
  const response = await fetch('https://urlpreview.vercel.app/api/v1/preview?url='+encodeURI(originalUrl));
  if (response.status !== 200) throw new Error(response.message);
  const jsondata = await response.json();
  data.media.thumbnail = jsondata.image;
  return data;
}

const postMediaArray = async (userUid,data) => {
  let mediaArray = null;
  const { shareMediaCategory, media } = data;
  if(shareMediaCategory !== null && media !== null){
    if (shareMediaCategory === "IMAGE") mediaArray=[await mediaContent(userUid,data)]
    if (shareMediaCategory === "VIDEO") mediaArray=[await mediaContent(userUid,data)]
    if (shareMediaCategory === "ARTICLE") {
      data = await getThumbnail(data);
      mediaArray=[mediaArticle(data)]
    }
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