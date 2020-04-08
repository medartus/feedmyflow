import app from 'firebase/app';

const firebaseConfig = {
    apiKey: "AIzaSyChVTR8whxQvgeDN_elGu9-xmWB-UpyUbg",
    authDomain: "feedmyflow.firebaseapp.com",
    databaseURL: "https://feedmyflow.firebaseio.com",
    projectId: "feedmyflow",
    storageBucket: "feedmyflow.appspot.com",
    messagingSenderId: "159392585747",
    appId: "1:159392585747:web:4ac62c97775c8b7d7587e6",
    measurementId: "G-JJ9Z5RNNSC"
  };

  class Firebase {
    constructor() {
      app.initializeApp(firebaseConfig);
    }
  }
  
  export default Firebase;