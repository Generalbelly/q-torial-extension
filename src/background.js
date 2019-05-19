import browser from 'webextension-polyfill';
import { START_APP, SIGN_IN, SIGN_OUT, GET_EXT_VERSION, REDIRECT_USER, UPDATE_AUTH_STATE } from './constants/action-types';
import { ERROR, OK } from './constants/status-types';
import firebase from './firebase';
import store from './backgroundStore';

global.browser = browser;

firebase.init({
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VUE_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
});

chrome.runtime.onConnect.addListener(port => {
  if (port.name !== process.env.VUE_APP_NAME) return;

  let connected = true;
  port.onDisconnect.addListener(() => {
    connected = false;
  });

  const postMessage = (action, data) => {
    if (!connected) return;
    port.postMessage({
      action,
      data,
    });
  };

  const startApp = async () => {
    const user = await firebase.checkAuth();
    if (user) {
      postMessage(START_APP);
    } else {
      postMessage(REDIRECT_USER);
    }
  };

  firebase.watchAuth(async user => {
    postMessage(UPDATE_AUTH_STATE, user);
  });

  chrome.browserAction.onClicked.addListener(async () => {
    // TODO activeとそうじゃないときにアイコンの色を変更する
    await store.dispatch('setActive', !store.state.active);
    startApp();
  });

  if (store.state.active) {
    startApp();
  }

  port.onMessage.addListener(async request => {
    const { status } = request;
    if (status === ERROR) {
      console.log(request);
    }
  });
});

chrome.runtime.onMessageExternal.addListener(async (request = {}, sender, sendResponse) => {
  const { action = null, data = {} } = request;
  console.log(request);
  switch (action) {
    case SIGN_IN:
      try {
        await firebase.signIn(data.email, data.password);
        sendResponse({ status: OK });
      } catch (e) {
        sendResponse({ status: ERROR, message: e.message });
      }
      break;
    case SIGN_OUT:
      try {
        await firebase.signOut();
        sendResponse({ status: OK });
      } catch (e) {
        sendResponse({ status: ERROR, message: e.message });
      }
      break;
    case GET_EXT_VERSION:
      sendResponse({ status: OK, message: chrome.runtime.getManifest().version });
      break;
    default:
      throw Error('unknown action');
  }
  return true;
});

window.onload = () => {
  store.dispatch('setActive', false);
};
