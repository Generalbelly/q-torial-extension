import firebase from 'firebase/app';
import 'firebase/auth';
import store from './store';

export default {
  init(config) {
    firebase.initializeApp(config);
    firebase.auth().useDeviceLanguage();
  },
  async signIn(email, password) {
    console.log('signIn()');
    const { user } = await firebase.auth().signInWithEmailAndPassword(email, password);
    await store.dispatch('setUser', user);
  },
  async signOut() {
    console.log('signOut()');
    await firebase.auth().signOut();
    await store.dispatch('setUser', null);
  },
  checkAuth() {
    return new Promise((resolve) => {
      firebase.auth().onAuthStateChanged(user => resolve(user));
    });
  },
  watchAuth() {
    firebase.auth().onAuthStateChanged(async (user) => {
      console.log('watchAuth()', user);
      await store.dispatch('setUser', user);
    });
  },
};
