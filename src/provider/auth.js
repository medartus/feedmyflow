import Cookies from 'universal-cookie';
import fire from './firebase';

class Auth {
    constructor() {
      this.authenticated = false;
      this.cookies = new Cookies();
    }
  
    loginWithCookies(cb) {
        console.log('try to log with Cookies')
        let token = undefined;
        try {
            token = this.cookies.get('token');
        } catch (error) {cb(error)} 
        console.log('try to use token')
        this.firebaseInit(token,(error, result)=>{
            if (error !== null) {
                this.getToken(cb)
            }
            else {
                console.log('callback');
                try {
                    cb(null,true);
                } catch (error) {
                    console.log('callback error : ' + error)
                }
            }
        })
    }

      
    login(cb) {
        this.loginWithCookies((err,res)=>{
            if(err !== null) {
                console.log('redirect')
                window.location.href = 'https://us-central1-feedmyflow.cloudfunctions.net/redirect'
            }
            cb(null,true);
        })
    }
  
    logout(cb) {
      this.authenticated = false;
    }
  
    isAuthenticated() {
      return this.authenticated;
    }

    getURLParameter = (name) => {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(window.location.href) ||
          [null, ''])[1].replace(/\+/g, '%20')) || null;
      }
    
    firebaseInit = (token,cb) => {
        console.log('firebase init')
        fire.auth().signInWithCustomToken(token)
        .then(() => {
            console.log('loged in')
            this.authenticated = true
            cb(null,true);
        })
        .catch(()=>{
            console.log('not loged in')
            this.cookies.remove('token')
            cb(new Error("Token not working"));
        })
      }

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
    
    getToken = async (cb) => {
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
                this.firebaseInit(res.token,cb)
            } else {
                cb(new Error('Error in the token Function: ' + res.error))
            }
        }
    }
}
  
  export default new Auth();
  