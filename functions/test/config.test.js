require('dotenv').config()

const test = require('firebase-functions-test')({
    databaseURL: `https://${process.env.GCLOUD_PROJECT}.firebaseio.com`,
    storageBucket: `${process.env.GCLOUD_PROJECT}.appspot.com`,
    projectId: `${process.env.GCLOUD_PROJECT}`,
  }, process.env.GCLOUD_PROJECT === "dev-feedmyflow" ? './service-account-dev.json' : './service-account-prod.json');

  
test.mockConfig({
    "email": {
      "address": process.env.EMAIL_ADDRESS,
      "password": process.env.EMAIL_PASSWORD
    },
    "linkedin": {
      "client_secret": process.env.LINKEDIN_CLIENT_SECRET,
      "client_id": process.env.LINKEDIN_CLIENT_ID
    }
});

module.exports = test;