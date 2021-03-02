const fetch = require('node-fetch');
const env = require('../config.json');
const { admin } = require('../provider/firebase');

const db = admin.firestore();

class LinkedinApi {
  constructor(accessToken = undefined) {
    this.apiUrl = env.LINKEDIN_API_URL;
    this.accessToken = accessToken;
  }

  retrieveAccessToken(userUid){
    return new Promise( async (resolve,reject) => {
      const accessTokenDoc = await db.collection("user").doc(userUid).collection("adminData").doc("linkedin").get();
      if (!accessTokenDoc.exists) return reject(new Error('Token does not exist.'));
      this.accessToken = accessTokenDoc.data().accessToken;
      return resolve(this.accessToken);
    })
  }

  getAccessToken(){
    return this.accessToken;
  }

  request(reqType,{body,headers,params}={}){
    const requestInfo = env[reqType];

    const headersBearer = {'Authorization': `Bearer ${this.accessToken}`};
    const fullHeaders = { ...headers, ...headersBearer, ...requestInfo.headers };

    let requestUrl = this.apiUrl + requestInfo.url;
    
    requestInfo.params.forEach(p => {
      requestUrl = requestUrl.replace(p,params[p])
    });

    const requestContent = {
      method: requestInfo.requestMethod,
      headers: fullHeaders,
    }
    if(body) requestContent.body = JSON.stringify(body)

    return new Promise( async (resolve,reject) => {
      try {
        const response = await fetch(requestUrl,requestContent)
        const jsondata = await response.json();

        if (response.status !== 200) reject(jsondata);
        resolve(jsondata);
      }
      catch (error) { 
        reject(error) 
      }    
    })
  }
}

module.exports = LinkedinApi;