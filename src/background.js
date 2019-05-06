import {
  START_APP,
  SIGN_IN,
  SIGN_OUT,
  GET_EXT_VERSION, REDIRECT_USER,
} from "./constants/action-types";
import { ERROR, OK } from './constants/status-types';
import firebase from './firebase';

global.browser = require('webextension-polyfill');

firebase.init({
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VUE_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
});
firebase.watchAuth();

function getActiveTab() {
  return new Promise(resolve => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const activeTab = tabs[0];
      resolve(activeTab);
    });
  });
}

async function sendMessage(tabId = null, action = null, data = {}) {
  let activeTabId = tabId;
  if (!activeTabId) {
    const activeTab = await getActiveTab();
    activeTabId = activeTab.id;
  }
  console.log('activeTabId', activeTabId);
  return new Promise((resolve, reject) => {
    try {
      chrome.tabs.sendMessage(activeTabId, { app: process.env.VUE_APP_NAME, action, data }, response => {
        resolve(response);
      });
    } catch (e) {
      console.error(e);
      reject(e);
    }
  });
}

chrome.browserAction.onClicked.addListener(async tab => {
  const user = await firebase.checkAuth();
  if (user) {
    await sendMessage(tab.id, START_APP);
  } else {
    await sendMessage(tab.id, REDIRECT_USER);
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log('onUpdated');
});

// chrome.runtime.onMessage.addListener(function (request={}, sender, sendResponse) {
//     if (request.app === appName) {
//         if (request.status === 'OK') {
//             clearMeta()
//         }
//     }
// });

chrome.runtime.onMessageExternal.addListener(async (request = {}, sender, sendResponse) => {
  console.log('onMessageExternal', request);
  const { action = null, data = {} } = request;
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
      console.log(GET_EXT_VERSION);
      break;
    default:
      throw Error('unknown action');
  }
  return true;
});
