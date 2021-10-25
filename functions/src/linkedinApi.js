const fetch = require('node-fetch');
const request = require("request");
const env = require('../config.json');
const { admin } = require('../provider/firebase');
const functions = require('firebase-functions');

const db = admin.firestore();

class LinkedinApi {
  constructor(accessToken = undefined) {
    this.apiUrl = env.LINKEDIN_API_URL;
    this.accessToken = accessToken;
  }

  refreshAccessToken(refreshToken){
    return new Promise( async (resolve,reject) => {
      const url = "https://www.linkedin.com/oauth/v2/accessToken";
      const form = {
        "grant_type": "refresh_token",
        "refresh_token": refreshToken,
        "client_id": functions.config().linkedin.client_id,
        "client_secret": functions.config().linkedin.client_secret,
      };

      request.post({url: url, form: form}, (err, response, body) => {

        if (err) return reject(err);

        var res = JSON.parse(body);

        if (typeof res.error !== 'undefined') {
            err = new Error(res.error_description);
            err.name = res.error;
            return cb(err, null);
        }

        return resolve(res);
      })
    })
  }

  retrieveAccessToken(userUid){
    return new Promise( async (resolve,reject) => {
      const accessTokenDoc = await db.collection("user").doc(userUid).collection("adminData").doc("linkedin").get();
      if (!accessTokenDoc.exists) return reject(new Error('Token does not exist.'));

      if (accessTokenDoc.data().accessTokenExpiration.toDate() < new Date()) {
        this.refreshAccessToken(accessTokenDoc.data().refreshToken)
        .then(res=>{
          const { access_token, expires_in, refresh_token, refresh_token_expires_in } = res;
          this.accessToken = access_token;

          const date = new Date();
          const accessTokenExpiration = new Date(date.getTime()+expires_in*1000)
          const refreshTokenExpiration = new Date(date.getTime()+refresh_token_expires_in*1000)

          // Save the access token to the Firebase Realtime Database.
          db.collection('user').doc(userUid).collection('adminData').doc('linkedin')
            .set({
              'accessToken':access_token,
              'accessTokenExpiration':accessTokenExpiration,
              'refreshToken':refresh_token,
              'refreshTokenExpiration':refreshTokenExpiration
            });
            
          return resolve(this.accessToken);
        })
        .catch(err=>reject(err))

      } else {
        this.accessToken = accessTokenDoc.data().accessToken;
      }
      return resolve(this.accessToken);
    })
  }

  getAccessToken(){
    return this.accessToken;
  }
  
  setAccessToken(token){
    this.accessToken = token;
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

        if (response.status !== 200 && response.status !== 201) reject(jsondata);
        resolve(jsondata);
      }
      catch (error) { 
        reject(error) 
      }    
    })
  }
}

module.exports = LinkedinApi;