import Cookies from 'universal-cookie';
import fire from './firebase';

class Auth {
    constructor() {
      this.authenticated = false;
      this.cookies = new Cookies();
    }
  
    loginWithCookies = () => new Promise( (resolve, reject) => {
        console.log('try to log with Cookies')
        let token = undefined;
        try {
            token = this.cookies.get('token');
        } catch (error) {reject(error)} 
        if (token === undefined) reject(new Error('no Token'))
        else{
            console.log('try to use cookies token')
            this.firebaseInit(token)
            .then(()=>{
                console.log('log with cookies works')
                resolve()
            })
            .catch((err)=>{
                console.log('log with cookies failed')
                reject(err)
            })
        }
    })

      
    login = () => new Promise((resolve, reject) => {
        return this.loginWithCookies()
        .then(()=>{resolve()})
        .catch((err)=>{
            console.log(err)
            console.log('redirect')
            window.location.href = 'https://us-central1-feedmyflow.cloudfunctions.net/redirect'
        })
    })
  
    logout() {
      this.authenticated = false;
    }
  
    isAuthenticated() {
      return this.authenticated;
    }

    getURLParameter = (name) => {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(window.location.href) ||
          [null, ''])[1].replace(/\+/g, '%20')) || null;
      }
    
    firebaseInit = (token) => new Promise((resolve,reject) => {
        console.log('firebase init')
        fire.auth().signInWithCustomToken(token)
        .then(() => {
            console.log('loged in')
            this.authenticated = true
            resolve()
        })
        .catch((err)=>{
            console.log('not loged in')
            this.cookies.remove('token')
            reject(err)
        })
    })

    get = async (url) => {
        try {
          let response = await fetch(url, {method: "GET"});
          const jsondata = await response.json();
          return jsondata;
        }
        catch (error) {
          throw error;
        }    
    }
    
    getToken = () => new Promise(async (resolve, reject) => {
        console.log('try to get Token')
        var code = this.getURLParameter('code');
        var state = this.getURLParameter('state');
        if(code!==null){
            // This is the URL to the HTTP triggered 'token' Firebase Function.
            var tokenFunctionURL = 'https://us-central1-feedmyflow.cloudfunctions.net/token';
            let url = tokenFunctionURL +
            '?code=' + encodeURIComponent(code) +
            '&state=' + encodeURIComponent(state);
            let res = await this.get(url);
            if (res.token) {
                this.cookies.set('token', res.token.toString());
                this.firebaseInit(res.token).then(()=>resolve()).catch((err)=>reject(err))
            } else {
                reject(new Error('Error in the geToken call: ' + res.error))
            }
        }
    })
}
  
  export default new Auth();