const functions = require('firebase-functions');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

const MailProvider = require('./src/mailProvider');
const { postOnLinkedin } = require('./src/post');
const { createFirebaseAccount } = require('./src/user');
const { admin } = require('./provider/firebase');

const db = admin.firestore();

const OAUTH_SCOPES = ['r_liteprofile', 'r_emailaddress', 'w_member_social'];

/**
 * Creates a configured LinkedIn API Client instance.
 */
const linkedInClient = () => {
  // LinkedIn OAuth 2 setup
  return require('node-linkedin')(
    functions.config().linkedin.client_id,
    functions.config().linkedin.client_secret,
    // `http://localhost:3000/login`);
    `https://${process.env.GCLOUD_PROJECT}.web.app/login`);
}

/**
 * Redirects the User to the LinkedIn authentication consent screen. ALso the 'state' cookie is set for later state
 * verification.
 */
exports.redirect = functions.https.onRequest( (req, res) => {

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
  let firebaseToken;
  try {
    Linkedin.auth.authorize(OAUTH_SCOPES, req.query.state); // Makes sure the state parameter is set
    Linkedin.auth.getAccessToken(res, req.query.code, req.query.state, async (error, results) => {
      if (error) {
        throw error;
      }
      // Create a Firebase account and get the Custom Auth Token.
      firebaseToken = await createFirebaseAccount(results.access_token);
      
      res.status(200).jsonp({ token: firebaseToken });
    });
  } catch (error) {
    res.status(500).jsonp({ error: error.toString() });
  }
});


exports.LinkedinPost = functions.https.onRequest( async (req, res) => {
  try {
    const postCollection = await db.collectionGroup('post').where('publicationTime', '<', new Date()).get()
    if (postCollection.empty) {
      console.log('No matching documents.')
      return res.status(200).send('No matching documents.');
    }
    
    const promises = postCollection.docs.map(async(newPost) => {
      return await postOnLinkedin(newPost)
    });

    await Promise.all(promises)
    console.log('All new content has been posted on LinkedIn')
    return res.status(200).send('All new content has been posted on LinkedIn')

  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: error.toString() });
  }
})


exports.sendWelcomeEmail = functions.auth.user().onCreate((user) => {
  console.log(user)
  const mailProvider = new MailProvider()
  return mailProvider.sendWelcomeEmail(user.email,user.displayName)
    .then(()=> console.log('Welcome email sended to '+ user.uid))
    .catch((error)=> {console.log(error.toString())});
});