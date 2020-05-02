import browser from 'webextension-polyfill';
import {
  START_EXT,
  END_EXT,
  SIGN_IN,
  SIGN_OUT,
  VERSION,
  REDIRECT_TO_APP,
  PASS_DATA_TO_BACKGROUND,
  SELECT_TUTORIAL,
  UPDATE_STATE,
  CHECK_AUTH,
  FIREBAE_SIGN_IN,
} from './constants/command-types';
import { ERROR, OK } from './constants/status-types';
import { appFirebaseService, getUserFirebaseService } from './firebase';
import store from './store/backgroundStore';
import { SYNC_DATA } from './store/mutation-types';

global.browser = browser;

let connectedPort = null;
const connectHandler = async port => {
  if (connectedPort) {
    connectedPort.disconnect();
  }
  connectedPort = port;

  if (port.name !== process.env.VUE_APP_NAME) return;

  function sendCommand(command, data, id = null) {
    port.postMessage({
      command,
      data,
      id,
    });
  }

  async function startApp(resetState = false) {
    if (resetState) {
      await store.dispatch('resetState');
    }
    await store.dispatch('setActive', true);
    const user = await appFirebaseService.checkAuth();
    if (!user) {
      sendCommand(REDIRECT_TO_APP);
      return;
    }
    const firebaseUser = store.state.user.firebaseConfig
      ? await getUserFirebaseService(
          store.state.user.firebaseConfig
        ).checkAuth()
      : null;
    if (firebaseUser) {
      sendCommand(START_EXT);
    } else {
      sendCommand(REDIRECT_TO_APP);
    }
  }

  async function endApp(resetState = false) {
    if (resetState) {
      await store.dispatch('resetState');
    }
    sendCommand(END_EXT);
  }

  const unwatch = store.watch(
    (state, getters) => ({
      ...state,
      ...getters,
    }),
    async value => {
      console.log(value);
      if (!value.requesting && value.taskId) {
        const { taskId, ...val } = value;
        sendCommand(UPDATE_STATE, val, taskId);
        await store.dispatch('setTaskId', null);
      }
      if (value.firebaseConfig && !value.tutorialRepositoryReady) {
        await store.dispatch('initTutorialRepository');
      }
    },
    { deep: true }
  );

  const unsubscribe = appFirebaseService.watchAuth(async user => {
    await store.dispatch('updateLocalUser', user);
  });

  const browserActionHandler = async () => {
    if (!store.state.active) {
      await startApp(true);
    } else {
      await endApp();
      await store.dispatch('setActive', false);
    }
  };

  chrome.browserAction.onClicked.addListener(browserActionHandler);

  const onMessageHandler = async request => {
    const { command = '', data = {}, id = null } = request;
    console.log(command);
    console.log(data);
    switch (command) {
      case PASS_DATA_TO_BACKGROUND:
        await store.dispatch(data.action, data.payload);
        await store.dispatch('setTaskId', id);
        break;
      case SYNC_DATA:
        await store.dispatch('setTaskId', id);
        break;
      default:
        break;
    }
  };

  port.onMessage.addListener(onMessageHandler);

  port.onDisconnect.addListener(async () => {
    connectedPort = null;
    unwatch();
    unsubscribe();
    chrome.browserAction.onClicked.removeListener(browserActionHandler);
    port.onMessage.removeListener(onMessageHandler);
    port.disconnect();
  });

  if (store.state.active) {
    await startApp();
  }
};

chrome.runtime.onConnect.addListener(connectHandler);

chrome.runtime.onMessageExternal.addListener(
  async (request = {}, sender, sendResponse) => {
    const { command = null, data = {} } = request;
    const user = await appFirebaseService.checkAuth();
    console.log(command);
    console.log(data);
    switch (command) {
      case SIGN_IN:
        try {
          await store.dispatch('signIn', data);
          sendResponse({ status: OK });
        } catch (e) {
          sendResponse({ status: ERROR, message: e.message });
        }
        break;
      case FIREBAE_SIGN_IN:
        try {
          await store.dispatch('firebaseSignIn', data);
          sendResponse({ status: OK });
        } catch (e) {
          sendResponse({ status: ERROR, message: e.message });
        }
        break;
      case SIGN_OUT:
        try {
          await store.dispatch('signOut');
          sendResponse({ status: OK });
        } catch (e) {
          sendResponse({ status: ERROR, message: e.message });
        }
        break;
      case VERSION:
        sendResponse({
          status: OK,
          message: chrome.runtime.getManifest().version,
        });
        break;
      case CHECK_AUTH:
        sendResponse({
          status: user ? OK : ERROR,
        });
        break;
      default:
        throw Error('unknown command');
    }
    return true;
  }
);
