require('dotenv').config()

const test = require('firebase-functions-test')({
    databaseURL: `https://${process.env.GCLOUD_PROJECT}.firebaseio.com`,
    storageBucket: `${process.env.GCLOUD_PROJECT}.appspot.com`,
    projectId: `${process.env.GCLOUD_PROJECT}`,
  }, process.env.GCLOUD_PROJECT === "dev-feedmyflow" ? './service-account-dev.json' : './service-account-prod.json');


  
test.mockConfig({
    "email": {
      "password": process.env.EMAIL_PASSWORD
    },
    "linkedin": {
      "client_secret": process.env.LINKEDIN_CLIENT_SECRET,
      "client_id": process.env.LINKEDIN_CLIENT_ID
    }
});

// // "Wrap" the makeUpperCase function from index.js
// const MailProvider = require('../mailProvider.js');
// const mailProvider = new MailProvider();
// const wrapped = test.wrap(mailProvider.sendPostConfirmation);

// wrapped('wrongUserUid');

const LinkedinApi = require('../linkedinApi.js');
const linkedinApi = new LinkedinApi();
const wrapped = test.wrap(linkedinApi.generateBodyContent);

wrapped('wrongUserUid');