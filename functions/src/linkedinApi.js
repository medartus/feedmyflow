const request = require('./request');

class LinkedinApi {
  constructor(accessToken) {
    this.apiUrl = "https://api.linkedin.com/v2/"
    this.accessToken = accessToken;
  }
  
  me(){
    return request.get(this.accessToken,this.apiUrl+"me?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams))")
  }

  email(){
    return request.get(this.accessToken,this.apiUrl+"emailAddress?q=members&projection=(elements*(handle~))")
  }

  postData(body){
    return request.post(this.accessToken,this.apiUrl+"ugcPosts",body)
  }

  registerImage(body,headers={}){
    return request.post(this.accessToken,this.apiUrl+"assets?action=registerUpload",body,headers)
  }

}

module.exports = LinkedinApi;