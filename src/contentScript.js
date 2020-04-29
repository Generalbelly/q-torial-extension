import Vue from 'vue';
// import VueI18n from 'vue-i18n'
import Buefy from 'buefy';
import VeeValidate from 'vee-validate';
import './vee-validate';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import '../sass/main.scss';
import './fontawesome';
import store from './store/store';
import App from './App';
import {
  START_EXT,
  END_EXT,
  ROUTE,
  REDIRECT_TO_APP,
  PASS_DATA_TO_BACKGROUND,
  UPDATE_STATE,
} from './constants/command-types';
import { ERROR, OK } from './constants/status-types';
import { SYNC_DATA } from './store/mutation-types';

// Vue.use(VueI18n)

// Buefy
Vue.use(Buefy, {
  defaultIconPack: 'fas',
  defaultIconComponent: FontAwesomeIcon,
});

// VeeValidate
Vue.use(VeeValidate, {
  aria: true,
  classNames: {},
  classes: false,
  delay: 1,
  dictionary: null,
  errorBagName: 'errors', // change if property conflicts
  events: 'input|blur',
  fieldsBagName: 'fields',
  i18n: null, // the vue-i18n plugin instance
  i18nRootKey: 'validations', // the nested key under which the validation messages will be located
  inject: true,
  locale: 'en',
  validity: false,
});

// class ExtAppError extends Error {
//   constructor(type, message) {
//     super();
//     this.type = type;
//     this.message = message;
//   }
// }

class ExtApp {
  iframeId = process.env.VUE_APP_NAME;

  appId = `${process.env.VUE_APP_NAME}-app`;

  injectScript(file, node) {
    const th = document.getElementsByTagName(node)[0];
    const script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', file);
    th.appendChild(script);
  }

  getIframeElement() {
    return document.querySelector(`iframe#${this.iframeId}`);
  }

  start() {
    const iframeElement = this.getIframeElement();
    if (iframeElement) return;
    const iframe = document.createElement('iframe');
    iframe.allow = 'fullscreen';
    iframe.style.zIndex = '2147483649';
    iframe.style.position = 'fixed';
    iframe.style.bottom = '0';
    iframe.style.right = '0';
    iframe.style.left = '0';
    iframe.style.width = '100%';
    iframe.style.height = '100px';
    iframe.id = this.iframeId;
    const self = this;
    iframe.onload = function() {
      const doc = this.contentDocument || this.contentWindow.document;
      const linkElement = doc.createElement('link');
      linkElement.rel = 'stylesheet';
      linkElement.type = 'text/css';
      linkElement.href = chrome.runtime.getURL('contentScript.css');
      doc.head.appendChild(linkElement);

      const divElement = doc.createElement('div');
      divElement.id = self.appId;
      doc.body.appendChild(divElement);
      const app = new Vue({
        render: h => h(App),
        store,
      });
      app.$mount(divElement);
    };
    document.body.appendChild(iframe);

    this.injectScript(chrome.runtime.getURL('spaUrlWatcher.js'), 'body');
  }

  end() {
    const iframeElement = this.getIframeElement();
    iframeElement.parentNode.removeChild(iframeElement);
  }
}

let extApp = null;

const WHITE_LIST = [
  'https://console.firebase.google.com',
  process.env.VUE_APP_URL,
];

async function startApp() {
  if (!extApp) {
    extApp = new ExtApp();
  }
  if (!WHITE_LIST.includes(window.location.origin)) {
    extApp.start();
  }
}

async function endApp() {
  if (!extApp) return;
  extApp.end();
}

const port = chrome.runtime.connect({
  name: process.env.VUE_APP_NAME,
});

let connected = true;
port.onDisconnect.addListener(() => {
  connected = false;
});

let isWebListenerAttached = false;
// let openedWindow = null;
port.onMessage.addListener(async request => {
  const sendCommand = (
    { status = null, message = null, data = null, command = null, id = null },
    to = 'background'
  ) => {
    try {
      if (to === 'background') {
        if (!connected) return;
        port.postMessage({
          status,
          message,
          command,
          data,
          id,
        });
      } else if (to === 'web') {
        window.postMessage(
          {
            app: process.env.VUE_APP_NAME,
            command: UPDATE_STATE,
            data,
            id,
          },
          window.location.origin
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCommand = async (command, data, id) => {
    switch (command) {
      case START_EXT:
        try {
          await startApp();
          sendCommand({
            status: OK,
          });
        } catch (e) {
          sendCommand({
            status: ERROR,
            message: e.message,
          });
        }
        break;
      case END_EXT:
        try {
          if (window.location.origin !== process.env.VUE_APP_URL) {
            await endApp();
            sendCommand({
              status: OK,
            });
          }
        } catch (e) {
          sendCommand({
            status: ERROR,
            message: e.message,
          });
        }
        break;
      case REDIRECT_TO_APP:
        if (window.location.origin !== process.env.VUE_APP_URL) {
          // const w = 520;
          // const h = 570;
          // const left = window.screen.width / 2 - w / 2;
          // const top = window.screen.height / 2 - h / 2;
          window.location.href = `${process.env.VUE_APP_URL}/sign-in?source=extension&redirect=${window.location.href}`;
          // openedWindow = window.open(
          //   ,
          //   '_blank',
          //   `location=yes,height=${h},width=${w},top=${top},left=${left},scrollbars=yes,status=yes`
          // );
        }
        break;
      case ROUTE:
        window.location.href = data;
        break;
      case PASS_DATA_TO_BACKGROUND:
        sendCommand({
          command,
          data,
        });
        break;
      case SYNC_DATA:
        sendCommand({
          command,
          id,
        });
        break;
      case UPDATE_STATE:
        sendCommand(
          {
            command,
            data,
            id,
          },
          'web'
        );
        break;
      default:
        break;
    }
  };

  const addWebListner = async () => {
    window.addEventListener('message', async event => {
      if (event.source !== window) return;
      if (typeof event.data !== 'object' || Array.isArray(event.data)) return;
      const { app = null, command = null, data = null, id = null } = event.data;
      if (app !== process.env.VUE_APP_NAME) return;
      sendCommand({
        command,
        data,
        id,
      });
    });
    isWebListenerAttached = true;
  };

  if (!isWebListenerAttached) {
    await addWebListner();
  }

  const { command = null, data = {}, id = null } = request;
  await handleCommand(command, data, id);
});
