import React, { useState, useEffect, useContext, createContext } from "react";
import Cookies from 'universal-cookie';
import fire from './firebase';

const authContext = createContext();
export default authContext;
// Provider component that wraps your app and makes auth object ...
// ... available to any child component that calls useAuth().
export function ProvideAuth({ children }) {
  const auth = useProvideAuth();
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

// Hook for child components to get the auth object ...
// ... and re-render when it changes.
export const useAuth = () => {
  return useContext(authContext);
};

// Provider hook that creates auth object and handles state
const useProvideAuth = () => {
  const [authStatus, setAuthStatus] = useState({ haveTriedLogin: false, isConnected: false, user: undefined, firebaseTestLogin: false });
  const cookies = new Cookies();

  const getURLParameter = (name) => {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(window.location.href) ||
      [null, ''])[1].replace(/\+/g, '%20')) || null;
  }

  const get = async (url) => {
    try {
      let response = await fetch(url, { method: "GET" });
      const jsondata = await response.json();
      return jsondata;
    }
    catch (error) {
      throw error;
    }
  }

  const signInWithCustomToken = (token) => new Promise((resolve, reject) => {
    console.log('firebase init')
    fire.auth().signInWithCustomToken(token)
      .then(() => {
        console.log('loged in')
        resolve()
      })
      .catch((err) => {
        console.log('not loged in')
        cookies.remove('token')
        reject(err)
      })
  })

  const loginWithCookies = () => new Promise((resolve, reject) => {
    console.log('try to log with Cookies')
    let token = undefined;
    try {
      token = cookies.get('token');
    } catch (error) { reject(error) }
    if (token === undefined) reject('no Token')
    else {
      console.log('try to use cookies token')
      signInWithCustomToken(token)
        .then(() => {
          console.log('log with cookies works')
          resolve()
        })
        .catch((err) => {
          console.log('log with cookies failed')
          reject(err)
        })
    }
  })

  const getInfoFromUrl = () => new Promise(async (resolve, reject) => {
    console.log('try to get Token')
    var code = getURLParameter('code');
    var state = getURLParameter('state');
    if (code !== null) {
      // This is the URL to the HTTP triggered 'token' Firebase Function.
      var tokenFunctionURL = process.env.REACT_APP_API_URL + 'token';
      let url = tokenFunctionURL + '?code=' + encodeURIComponent(code) + '&state=' + encodeURIComponent(state);
      try {
        let res = await get(url);
        if (res.token) {
          console.log('info in url')
          cookies.set('token', res.token.toString());
          signInWithCustomToken(res.token).then(() => resolve()).catch((err) => reject(err))
        }
      } catch (error) { reject(error) }
    }
    else {
      console.log('no info in url')
      loginWithCookies()
        .then(() => { resolve() })
        .catch((err) => { reject(err) })
    }
  })

  // Wrap any Firebase methods we want to use making sure ...
  // ... to save the user to state.
  const signIn = (redirectToDashboard, props) => new Promise((resolve, reject) => {
    if (authStatus.isConnected) {
      resolve()
    }
    else {
      getInfoFromUrl()
        .then(() => {
          if (redirectToDashboard) props.history.push("/dashboard")
          resolve()
        })
        .catch((err) => {
          console.log(err)
          console.log('redirect')
          redirectCheck(0, resolve)
        })
    }
  });

  const redirectCheck = (index, resolve) => {
    console.log(authStatus)
    if (authStatus.firebaseTestLogin || index >= 10) {
      if (authStatus.isConnected) resolve()
      else window.location.href = process.env.REACT_APP_API_URL + 'redirect'
    }
    else {
      setTimeout(() => {
        redirectCheck(index + 1, resolve)
      }, 500)
    }
  }

  const signOut = (props) => {
    return fire
      .auth()
      .signOut()
      .then(() => {
        props.history.push('/')
        setAuthStatus({ ...authStatus, isConnected: false, user: undefined, haveTriedLogin: false });
      });
  };


  // Subscribe to user on mount
  // Because this sets state in the callback it will cause any ...
  // ... component that utilizes this hook to re-render with the ...
  // ... latest auth object.
  useEffect(() => {
    const unsubscribe = fire.auth().onAuthStateChanged(user => {
      if (user) {
        console.log("status change connected")
        try {
          setAuthStatus({ ...authStatus, isConnected: true, user, haveTriedLogin: true, firebaseTestLogin: true });
        } catch (error) {
          console.log(error)
        }
      } else {
        setAuthStatus({ ...authStatus, isConnected: false, user: undefined, haveTriedLogin: false, firebaseTestLogin: true });
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Return the user object and auth methods
  return {
    authStatus,
    signOut,
    signIn,
  };
}