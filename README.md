<h1>Feed My Flow </h1>

> Feed My Flow is a Software as a Service that provides easy scheduling LinkedIn posts.

<h2> Table of Contents </h2>

- [How It Works](#how-it-works)
  - [React](#react)
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

![Archi](https://user-images.githubusercontent.com/45569127/81713102-bfe8a200-9475-11ea-8b52-5a9cd833402a.png)

### React

### Firebase

#### Cloud Functions

#### Cloud Firestore

#### Authentification

#### Hosting

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

## License

**Feed My Flow** © [Marc-Etienne Dartus](https://github.com/medartus), Created by [Marc-Etienne Dartus](https://github.com/medartus), [Nicolas Caillieux](https://github.com/Exorth98) and [Alexandre Zajac](https://github.com/alexZajac). Released under the [MIT](https://github.com/medartus/feedmyflow/blob/master/README.md) License.<br>
Maintained with help from [contributors](https://github.com/medartus/feedmyflow/contributors).