import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';

export const { FieldValue } = firebase.firestore;

export default class FirebaseService {
  app;

  db;

  functions;

  auth;

  constructor(config, name = null) {
    this.app = firebase.initializeApp(config, name);
    this.functions = this.app.functions();
    this.db = this.app.firestore();
    this.db.enablePersistence({ synchronizeTabs: true });
    this.auth = this.app.auth();
    this.auth.useDeviceLanguage();
  }

  // async signUp(email, password) {
  //   return this.auth.createUserWithEmailAndPassword(email, password);
  // }

  async signIn(email, password) {
    return this.auth.signInWithEmailAndPassword(email, password);
  }

  async signOut() {
    return this.auth.signOut();
  }

  checkAuth() {
    return new Promise(resolve => {
      const unsubscribe = this.auth.onAuthStateChanged(user => {
        resolve(user);
        unsubscribe();
      });
    });
  }

  watchAuth(handler) {
    return this.auth.onAuthStateChanged(handler);
  }

  /**
   * @return {firebase.firestore.Firestore}
   *
   */
  getDB() {
    return this.db;
  }
}

export const appFirebaseService = new FirebaseService(
  {
    apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
    authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.VUE_APP_FIREBASE_DATABASE_URL,
    projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VUE_APP_FIREBASE_APP_ID,
  },
  process.env.VUE_APP_NAME
);

const userFirebaseService = (name = 'user') => {
  let service;
  return (config = {}) => {
    if (!service) {
      service = new FirebaseService(
        {
          apiKey: config.apiKey,
          authDomain: config.authDomain,
          databaseURL: config.databaseURL,
          projectId: config.projectId,
          storageBucket: config.storageBucket,
          messagingSenderId: config.messagingSenderId,
          appId: config.appId,
        },
        name
      );
    }
    return service;
  };
};

export const getUserFirebaseService = userFirebaseService();
