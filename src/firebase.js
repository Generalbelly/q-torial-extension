import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import store from './backgroundStore';

export const { Timestamp, FieldValue } = firebase.firestore;

export const convertDocToObject = doc => {
  const data = {
    id: doc.id,
    ...doc.data(),
  };
  if (data.createdAt) {
    data.createdAtAsDate = data.createdAt.toDate().toLocaleDateString();
  }
  if (data.updatedAt) {
    data.updatedAtAsDate = data.updatedAt.toDate().toLocaleDateString();
  }
  return data;
};

export const convertDocumentsToArray = snapshot => {
  return snapshot.docs.map(doc => convertDocToObject(doc));
};

let db = null;
export default {
  init(config) {
    firebase.initializeApp(config);
    firebase.auth().useDeviceLanguage();
    db = firebase.firestore();
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
      await store.dispatch('setUser', user);
      cb(user);
    });
  },
  getDB() {
    return db;
  },
};
