const generateMediaArray = (data) => {
    let mediaArray = null;
    const { shareMediaCategory, media } = data;
    if(shareMediaCategory !== null && shareMediaCategory !== "NONE" && media !== null){
      const { description, originalUrl, title } = media;
      mediaArray=[{
        "status": "READY",
        "description": {
          "text": description 
        },
        "originalUrl": originalUrl,
        "title": {
          "text": title
        }
      }]
    }
    return mediaArray;
  }

const generateBodyContent = (data) => {
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
      
      const mediaArray = generateMediaArray(data);
      if(mediaArray !== null){
        body.specificContent["com.linkedin.ugc.ShareContent"].media = mediaArray;
      }
    }
    return body;
  }

module.exports = { generateBodyContent }