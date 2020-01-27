import browser from 'webextension-polyfill';
import {
  START_EXT,
  END_EXT,
  SIGN_IN,
  SIGN_OUT,
  VERSION,
  REDIRECT_TO_APP,
  UPDATE_AUTH_STATE,
  PASS_DATA_TO_BACKGROUND,
  SELECT_TUTORIAL,
  UPDATE_STATE,
} from './constants/command-types';
import { ERROR, OK } from './constants/status-types';
import { appFirebaseService } from './firebase';
import store from './store/backgroundStore';
import { SYNC_DATA } from './store/mutation-types';

global.browser = browser;

const connectHandler = async port => {
  if (port.name !== process.env.VUE_APP_NAME) return;

  let connected = true;

  function sendCommand(command, data, id = null) {
    if (!connected) return;
    port.postMessage({
      command,
      data,
      id,
    });
  }

  async function startApp(resetState = false) {
    const user = await appFirebaseService.checkAuth();
    if (user) {
      if (resetState) {
        await store.dispatch('resetState');
      }
      await store.dispatch('setActive', true);
      await store.dispatch('getUser');
      await store.dispatch('checkFirebaseConfig');
      await store.dispatch('checkUserPaymentInfo');
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
    sendCommand(UPDATE_AUTH_STATE, user);
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
    connected = false;
    unwatch();
    unsubscribe();
    chrome.browserAction.onClicked.removeListener(browserActionHandler);
    port.onMessage.removeListener(onMessageHandler);
    port.disconnect();
  });

  const user = await appFirebaseService.checkAuth();
  if (user && store.state.active) {
    await startApp();
  }
};

chrome.runtime.onConnect.addListener(connectHandler);

chrome.runtime.onMessageExternal.addListener(
  async (request = {}, sender, sendResponse) => {
    const { command = null, data = {} } = request;
    switch (command) {
      case SIGN_IN:
        try {
          const { user } = await appFirebaseService.signIn(
            data.email,
            data.password
          );
          await store.dispatch('updateLocalUser', user);
          await store.dispatch('getUser');
          await store.dispatch('checkFirebaseConfig', data);
          await store.dispatch('checkUserPaymentInfo');
          sendResponse({ status: OK });
        } catch (e) {
          sendResponse({ status: ERROR, message: e.message });
        }
        break;
      case SIGN_OUT:
        try {
          await appFirebaseService.signOut();
          await store.dispatch('updateLocalUser', null);
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
      case SELECT_TUTORIAL:
        await store.dispatch('selectTutorial', data);
        await store.dispatch('setActive', true);
        sendResponse({
          status: OK,
          message: 'Tutorial is just selected.',
        });
        break;
      default:
        throw Error('unknown command');
    }
    return true;
  }
);
