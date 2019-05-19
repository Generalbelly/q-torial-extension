import firebase from 'firebase/app';
import 'firebase/auth';
import store from './backgroundStore';

export default {
  init(config) {
    firebase.initializeApp(config);
    firebase.auth().useDeviceLanguage();
  },
  async signIn(email, password) {
    const { user } = await firebase.auth().signInWithEmailAndPassword(email, password);
    await store.dispatch('setUser', user);
    return user;
  },
  async signOut() {
    await firebase.auth().signOut();
    await store.dispatch('setUser', null);
  },
  checkAuth() {
    return new Promise(resolve => {
      firebase.auth().onAuthStateChanged(user => resolve(user));
    });
  },
  watchAuth(cb) {
    firebase.auth().onAuthStateChanged(async user => {
      console.log('watchAuth()', user);
      await store.dispatch('setUser', user);
      cb(user);
    });
  },
};
