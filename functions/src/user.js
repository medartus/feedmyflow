const { admin } = require('../provider/firebase');
const db = admin.firestore();
const LinkedinApi = require('./linkedinApi');

const extractUserInfo = async (accessToken) => {
  const linkedinApi = new LinkedinApi(accessToken);
  let userResults = await linkedinApi.me();
  let emailResults = await linkedinApi.email();
  
  const language = userResults.firstName.preferredLocale.language+"_"+userResults.firstName.preferredLocale.country;
  // We have a LinkedIn access token and the user identity now.
  const linkedInUserID = userResults.id
  
  let profilePic = undefined;
  if(userResults.profilePicture !== undefined) profilePic = userResults.profilePicture["displayImage~"].elements[1].identifiers[0].identifier;
  const firstName = userResults.firstName.localized[language];
  const lastName = userResults.lastName.localized[language];
  const email = emailResults.elements[0]["handle~"].emailAddress;

  return { linkedInUserID, firstName, lastName, profilePic, email, accessToken }
}


/**
 * Creates a Firebase account with the given user profile and returns a custom auth token allowing
 * signing-in this account.
 * Also saves the accessToken to the datastore at /linkedInAccessToken/$uid
 *
 * @returns {Promise<string>} The Firebase custom auth token in a promise.
 */
const createFirebaseAccount = async (accessToken) => {
  try {
    const { linkedInUserID, firstName, lastName, profilePic, email } = await extractUserInfo(accessToken);
    
    // The UID we'll assign to the user.
    const uid = `linkedin:${linkedInUserID}`;
  
    // Save the access token to the Firebase Realtime Database.
    const databaseTask = db.collection('user').doc(uid).collection('adminData').doc('linkedin').set({'accessToken':accessToken});
    // Create or update the user account.
    const userCreationTask = admin.auth().updateUser(uid, {
      displayName: firstName+" "+lastName,
      photoURL: profilePic,
      email: email,
      emailVerified: true,
    }).catch((error) => {
      // If user does not exists we create it.
      if (error.code === 'auth/user-not-found') {
        return admin.auth().createUser({
          uid: uid,
          displayName: firstName+" "+lastName,
          photoURL: profilePic,
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
    
    return token;
  } catch (error) {
    return error;
  }
}
  
module.exports = { createFirebaseAccount };