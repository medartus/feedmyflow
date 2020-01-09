import Cookies from 'universal-cookie';
import fire from './firebase';

class Auth {
    constructor() {
      this.cookies = new Cookies();
      this.setAuthStatus = null;
      this.props = null;
    }
  
    loginWithCookies = () => new Promise( (resolve, reject) => {
        console.log('try to log with Cookies')
        let token = undefined;
        try {
            token = this.cookies.get('token');
        } catch (error) {reject(error)} 
        if (token === undefined) reject('no Token')
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

    login = (props,setAuthStatus) => new Promise((resolve, reject) => {
        if(props !== undefined) this.props = props;
        if(setAuthStatus !== undefined) this.setAuthStatus = setAuthStatus;
        return this.loginWithCookies()
        .then(()=>{
            this.setAuthStatus({status:"connected",triedLogin:true})
            if(this.props != undefined) this.props.history.push('/dashboard')
            resolve()
        })
        .catch((err)=>{
            console.log(err)
            console.log('redirect')
            window.location.href = 'https://us-central1-feedmyflow.cloudfunctions.net/redirect'
        })
    })

    getURLParameter = (name) => {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(window.location.href) ||
            [null, ''])[1].replace(/\+/g, '%20')) || null;
    }
    
    firebaseInit = (token) => new Promise((resolve,reject) => {
        console.log('firebase init')
        fire.auth().signInWithCustomToken(token)
        .then(() => {
            console.log('loged in')
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
            try {
                let res = await this.get(url);
                if (res.token) {
                    console.log('info in url')
                    this.cookies.set('token', res.token.toString());
                    this.firebaseInit(res.token).then(()=>resolve()).catch((err)=>reject(err))
                }
            } catch (error) {reject(error)}
        }
        else{
            console.log('no info in url')
            this.login()
            .then(()=>{resolve()})
            .catch((err)=>{reject(err)})
        }
    })

    loginWithCode = (setAuthStatus) => new Promise((resolve, reject) => {
        this.setAuthStatus = setAuthStatus;
        return this.getToken()
        .then(()=>{
            setAuthStatus({status:"connected",triedLogin:true})
        })
        .catch((err)=>{
            console.log(err)
            setAuthStatus({status:"disconnected",triedLogin:true})
        })
    })

    logout = (props,setAuthStatus) => new Promise((resolve,reject)=>{
        // this.cookies.remove('token')
        props.history.push('/')
        setAuthStatus({status:"disconnected",triedLogin:false});
        resolve()
        // fire.auth().signOut()
        // .then(()=> {
        //     resolve()
        // }).catch((error) =>{
        //     console.log(error)
        //     reject(error)
        // });
    })
}
  
  export default new Auth();