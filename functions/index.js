const functions = require('firebase-functions');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const cors = require('cors')({origin: true});

const LinkedinApi = require('./linkedinApi');
const MailProvider = require('./mailProvider');


// Firebase Setup
const admin = require('firebase-admin');
const pathServiceAccount = process.env.GCLOUD_PROJECT === "dev-feedmyflow" ? './service-account-dev.json' : './service-account-prod.json';
const serviceAccount = require(pathServiceAccount);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${process.env.GCLOUD_PROJECT}.firebaseio.com`,
});


const OAUTH_SCOPES = ['r_liteprofile', 'r_emailaddress', 'w_member_social'];

let db = admin.firestore();

/**
 * Creates a configured LinkedIn API Client instance.
 */
function linkedInClient() {
  // LinkedIn OAuth 2 setup
  // TODO: Configure the `linkedin.client_id` and `linkedin.client_secret` Google Cloud environment variables.
  return require('node-linkedin')(
      functions.config().linkedin.client_id,
      functions.config().linkedin.client_secret,
      `http://localhost:3000/login`);
      // `https://${process.env.GCLOUD_PROJECT}.web.app/login`);
}

/**
 * Redirects the User to the LinkedIn authentication consent screen. ALso the 'state' cookie is set for later state
 * verification.
 */
exports.redirect = functions.https.onRequest((req, res) => {
  const Linkedin = linkedInClient();

  cookieParser()(req, res, () => {
    const state = req.cookies.state || crypto.randomBytes(20).toString('hex');
    console.log('Setting verification state:', state);
    res.cookie('state', state.toString(), {
      maxAge: 3600000,
      secure: true,
      httpOnly: true,
    });
    Linkedin.auth.authorize(res, OAUTH_SCOPES, state.toString());
  });
});

/**
 * Exchanges a given LinkedIn auth code passed in the 'code' URL query parameter for a Firebase auth token.
 * The request also needs to specify a 'state' query parameter which will be checked against the 'state' cookie.
 * The Firebase custom auth token is sent back in a JSONP callback function with function name defined by the
 * 'callback' query parameter.
 */
exports.token = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  const Linkedin = linkedInClient();
  try {
    return cookieParser()(req, res, () => {
      // if (!req.cookies.state && !req.body.state) {
      //   throw new Error('State cookie not set or expired. Maybe you took too long to authorize. Please try again.');
      // }
      // console.log('Received verification state:', req.cookies.state);
      // Linkedin.auth.authorize(OAUTH_SCOPES, req.cookies.state); // Makes sure the state parameter is set
      Linkedin.auth.authorize(OAUTH_SCOPES, req.query.state); // Makes sure the state parameter is set
      console.log('Received auth code:', req.query.code);
      console.log('Received state:', req.query.state);
      Linkedin.auth.getAccessToken(res, req.query.code, req.query.state, async (error, results) => {
        if (error) {
          throw error;
        }
        console.log('Received Access Token:', results.access_token);
        const linkedinApi = new LinkedinApi(results.access_token);
        const userResults = await linkedinApi.me();
        console.log('users result received:', userResults);
        const emailResults = await linkedinApi.email();
        console.log('users result received:', emailResults);

        const language = userResults.firstName.preferredLocale.language+"_"+userResults.firstName.preferredLocale.country;
        console.log(language)
        // We have a LinkedIn access token and the user identity now.
        const accessToken = results.access_token;
        const linkedInUserID = userResults.id
        console.log(linkedInUserID)
        let profilePic = undefined;
        if(userResults.profilePicture !== undefined) profilePic = userResults.profilePicture["displayImage~"].elements[1].identifiers[0].identifier;
        console.log(profilePic) 
        const firstName = userResults.firstName.localized[language];
        console.log(firstName)
        const lastName = userResults.lastName.localized[language];
        console.log(lastName)
        const email = emailResults.elements[0]["handle~"].emailAddress;
        console.log(email)
        // Create a Firebase account and get the Custom Auth Token.
        const firebaseToken = await createFirebaseAccount(linkedInUserID, firstName, lastName, profilePic, email, accessToken);
        console.log(firebaseToken)
        // Serve an HTML page that signs the user in and updates the user profile.
        res.jsonp({
          token: firebaseToken,
        });
      });
    });
  } catch (error) {
    console.log(error.toString())
    return res.jsonp({ error: error.toString() });
  }
});


/**
 * Creates a Firebase account with the given user profile and returns a custom auth token allowing
 * signing-in this account.
 * Also saves the accessToken to the datastore at /linkedInAccessToken/$uid
 *
 * @returns {Promise<string>} The Firebase custom auth token in a promise.
 */
async function createFirebaseAccount(linkedinID, firstName, lastName, photoURL, email, accessToken) {
  // The UID we'll assign to the user.
  const uid = `linkedin:${linkedinID}`;

  // Save the access token tot he Firebase Realtime Database.
  // const databaseTask = admin.database().ref(`/linkedInAccessToken/${uid}`).set(accessToken);
  //TODO add expiration date
  const databaseTask = db.collection('user').doc(uid).collection('adminData').doc('linkedin').set({'accessToken':accessToken});
  // Create or update the user account.
  const userCreationTask = admin.auth().updateUser(uid, {
    displayName: firstName+" "+lastName,
    photoURL: photoURL,
    email: email,
    emailVerified: true,
  }).catch((error) => {
    // If user does not exists we create it.
    if (error.code === 'auth/user-not-found') {
      return admin.auth().createUser({
        uid: uid,
        displayName: firstName+" "+lastName,
        photoURL: photoURL,
        email: email,
        emailVerified: true,
      });
    }
    throw error;
  });

  // Wait for all async task to complete then generate and return a custom auth token.
  await Promise.all([userCreationTask, databaseTask]);
  // Create a Firebase custom auth token.
  const token = await admin.auth().createCustomToken(uid);
  // console.log('Created Custom token for UID "', uid, '" Token:', token);
  return token;
}

exports.LinkedinPost = functions.https.onRequest( async (req, res) => {
  const linkedinApi = new LinkedinApi(null);
  try {
    const postCollection = await db.collectionGroup('post').where('publicationTime', '<', new Date()).get()
    if (postCollection.empty) {
      throw new Error('No matching documents.');
    }
    postCollection.forEach( async (doc) => {
      const body = linkedinApi.generateBodyContent(doc.data());
      if(body === null){
        throw new Error('Cannot build body');
      }
      const userUid = doc.data().userUID
      if(userUid === "linkedin:hV1NxWo7fQ" || process.env.GCLOUD_PROJECT === "feedmyflow"){
        console.log(userUid)
        const accessTokenDoc = await db.collection("user").doc(userUid).collection("adminData").doc("linkedin").get();
        console.log(accessTokenDoc.data())
        if (!accessTokenDoc.exists) {
          throw new Error('No such document.');
        } else {
          linkedinApi.setAccessToken(accessTokenDoc.data().accessToken);
          let result,error;
          await linkedinApi.post("https://api.linkedin.com/v2/ugcPosts",body).then((res)=> result = res).catch((err)=>error = err)
          if(error !== undefined) res.json({ error: error});
          else {
            //TODO uncomment delete post
            db.collection('user').doc(userUid).collection('post').doc(doc.id).delete()
            const mailProvider = new MailProvider()
            mailProvider.sendPostConfirmation(userUid)
              .then(()=> {return res.send('Sended')})
              .catch((error)=> {return res.send(error.toString())});
          }
        }
      }
    });
  } catch (error) {
    return res.json({ error: error.toString() });
  }
  // res.jsonp({ 'success':'All post worked'});
  return null;
})

exports.sendWelcomeEmail = functions.auth.user().onCreate((user) => {
  const mailProvider = new MailProvider()
  return mailProvider.sendWelcomeEmail(user.email)
    .then(()=> console.log('Welcome email sended to '+ user.uid))
    .catch((error)=> {console.log(error.toString())});
});