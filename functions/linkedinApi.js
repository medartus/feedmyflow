const fetch = require('node-fetch');

class LinkedinApi {
  constructor(access_token) {
    this.apiUrl = "https://api.linkedin.com/v2/"
    this.access_token = access_token;
  }

  setAccessToken(access_token){
    this.access_token = access_token;
  }

  async get(url){
    try {
      let response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": "Bearer "+this.access_token,
        }
      });
      const jsondata = await response.json();
      return jsondata;
    }
    catch (error) {
      throw error;
    }    
  }

  post(url,body){
    return new Promise( async (resolve,reject) => {
      try {
        let response = await fetch(url, {
          method: "POST",
          headers: {
            "Authorization": "Bearer "+this.access_token,
          },
          body: JSON.stringify(body)
        })
        const jsondata = await response.json();
        if (jsondata.status !== 200) reject(jsondata.message)
        resolve(jsondata);
      }
      catch (error) {reject(error)}    
    })
  }

  async me(){
    return await this.get(this.apiUrl+"me?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams))")
  }

  async email(){
    return await this.get(this.apiUrl+"emailAddress?q=members&projection=(elements*(handle~))")
  }

  generateBodyContent(data){
    let mediaArray = null
    let body = null;
    if(data.shareMediaCategory !== null && data.shareMediaCategory !== "NONE" && data.media.description !== null && data.media.originalUrl !== null && data.media.title !== null){
      mediaArray=[{
        "status": "READY",
        "description": {
          "text": data.media.description 
        },
        "originalUrl": data.media.originalUrl,
        "title": {
          "text": data.media.title
        }
      }]
    }
    if(data.author!==null && data.visibility!==null && data.shareCommentary!==null && data.shareMediaCategory!==null){
      body = {
        "author": data.author,
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {
                    "text": data.shareCommentary
                },
                "shareMediaCategory": data.shareMediaCategory
            }
        },
        "visibility": {
            "com.linkedin.ugc.MemberNetworkVisibility": data.visibility
        }
      }
      if(mediaArray !== null){
        body.specificContent["com.linkedin.ugc.ShareContent"].media = mediaArray;
      }
    }
    return body;
  }
}

module.exports = LinkedinApi;