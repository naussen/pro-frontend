# PRO Concursos Frontend

This is the frontend for the PRO Concursos website.

## Build Process and Environment Variables

This project uses a build process to manage Firebase API keys securely. The `firebase-config.template.js` file contains placeholders for the API keys. During the build process (which is run by Netlify), the `build.js` script copies this template to `firebase-config.js` and injects the actual API keys from environment variables.

To deploy this site, you will need to configure the following environment variables in your Netlify settings:

- `API_KEY_NVP`: The Firebase API key for the `nvp-concursos.firebaseapp.com` domain.
- `API_KEY_PRO`: The Firebase API key for the `proconcursos.com.br` domain.

### A Note on Firebase API Key Security

It is important to understand that Firebase API keys are not secrets. They are public identifiers that tell your application which Firebase project to connect to. The security of your Firebase application is not based on keeping the API key hidden, but on a combination of **Firebase Authentication** and **Firebase Security Rules** (for Firestore, Storage, and Realtime Database).

This build process is in place to prevent the keys from being hardcoded in the source code repository, which is a best practice. It allows for different keys to be used in different environments (e.g., development, staging, production) without changing the code.

For more information, please see the official Firebase documentation on [API key security](https://firebase.google.com/docs/projects/api-keys).