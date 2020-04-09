const admin = require('firebase-admin');

const pathServiceAccount = process.env.GCLOUD_PROJECT === "dev-feedmyflow" ? '../service-account-dev.json' : '../service-account-prod.json';
const serviceAccount = require(pathServiceAccount);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.GCLOUD_PROJECT}.firebaseio.com`,
});

module.exports = { admin };