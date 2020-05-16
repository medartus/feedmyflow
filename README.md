<h1>Feed My Flow </h1>

> Feed My Flow is open source web application that provides easy scheduling LinkedIn posts.

<h2> Table of Contents </h2>

- [How It Works](#how-it-works)
  - [Firebase](#firebase)
    - [Cloud Functions](#cloud-functions)
    - [Cloud Firestore](#cloud-firestore)
    - [Authentification](#authentification)
    - [Hosting](#hosting)
- [Getting Started](#getting-started)
  - [Frontend Installation](#frontend-installation)
  - [Backend Installation](#backend-installation)
- [License](#license)

## How It Works

We use the React framework for the front end part and firebase for all the back end part.

![Archi](https://user-images.githubusercontent.com/45569127/81713102-bfe8a200-9475-11ea-8b52-5a9cd833402a.png)

### Firebase

Firebase is a great tool for develloper to create very cheap, fast and scalable application. Here we use some of their products such as:
- Cloud Functions
- Cloud Firestore
- Authentification
- Hosting

#### Cloud Functions

Cloud Functions are the serverless backend module from firebase. We don't need anymore to have our own backend that run all the time waiting for request. Cloud functions allows us to ony execute our code when we need.

On cloud functions we handle some functionnality:

**I. Login**

We connect to LinkedIn API to allow users to give us the credentials we need to create their account and post their content.

**II. Welcoming new user**

Whe send welcome email to every new user. The function is run by a trigger on the Firebase Authentification part.

**III. Posting content**

Every 15 minutes, we check if the user wants to posts somthing. If there is some, we post their content on LinkedIn and send them an email to tell them so.

#### Cloud Firestore

Cloud Firestore is one of the two NOSQL database on Firebase. We use the databse to store the content of their post and the crendential to connect to the Linkedin API.

#### Authentification

Firebase Authentification is a very easy way to enable login with email or third party provider such as Google or Facebook. LinkedIn is not handle natively by Firebase, this is why we have our own credentials function on Cloud Functons. You can still use the Authentification from firebase if you have some specific token and this what we have with LinkedIn API.

All in all, we store all the essential user's data on Authentification. Authentification provides us a really easy and convinient way to login without asking the user their credential everytime, Firebase Authentification do that for us !

#### Hosting

Hosting is a very fast and simple way to deploy our website. It provides us SSL security and a cool domain name. We simply build our React project and deploy the new version in a matter of second.

## Getting Started

Clone the repo

```
git clone https://github.com/medartus/feedmyflow.git
```

### Frontend Installation

1. Go to the website folder

```
cd website
```

2. Start the development server

```
npm start
```

3. (Optional) If you want to modify and use your own backend, you need to modify the `.env.development` file inside the website folder with the new API Url:
```
REACT_APP_API_URL=http://localhost:5001/dev-feedmyflow/us-central1/
```

### Backend Installation

1. Create a new [firebase project](https://console.firebase.google.com/) with the default configuration
2. Install firebase CLI

```
npm i -g firebase-tools
```

3. Select your firebase project by changing `your_project_name`

```
firebase use your_project_name
```

4. Open .firebaserc and change `dev-feedmyflow` by `your_project_name`
5. Add the development API Keys and other informations

```
firebase functions:config:set email.password="qdrfnuglteceudva" email.address="dev.feedmyflow@gmail.com"
firebase functions:config:set linkedin.client_id="7727h1qnnvnq0d" linkedin.client_secret="yhamVZLUW1Kg7VnY"
```

6. In the functions folder, save your API credentials locally

```
cd functions
firebase functions:config:get > .runtimeconfig.json
```

7. Set up the Admin credentials locally using the [firebase configuration ressources](https://firebase.google.com/docs/functions/local-emulator#set_up_admin_credentials_optional). Put the file in the functions folder with `service-account-dev.json`

8. Now you can run locally the backend

```
firebase emulators:start
```

9. (Optional) You can set your rules to secure your database.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /user/{userId}/post/{postId}{
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

## License

**Feed My Flow** © [Marc-Etienne Dartus](https://github.com/medartus), Created by [Marc-Etienne Dartus](https://github.com/medartus), [Nicolas Caillieux](https://github.com/Exorth98) and [Alexandre Zajac](https://github.com/alexZajac). Released under the [MIT](https://github.com/medartus/feedmyflow/blob/master/README.md) License.<br>
Maintained with help from [contributors](https://github.com/medartus/feedmyflow/contributors).