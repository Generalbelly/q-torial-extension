// Fontawesome
import Vue from 'vue';
import Buefy from 'buefy';
import VeeValidate from 'vee-validate';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import '../sass/main.scss';
import './fontawesome';
import store from './store';
import App from './App';
import { START_APP, REDIRECT_USER, UPDATE_AUTH_STATE } from './constants/action-types';
import { ERROR } from './constants/status-types';

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

  appId = 'app';

  init() {
    const iframeElement = document.querySelector(`iframe#${this.iframeId}`);
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
  }

  start() {
    console.log('starting');
  }
}

let extApp = null;

async function startApp() {
  if (!extApp) {
    extApp = new ExtApp();
    extApp.init();
  }
  extApp.start();
}

const port = chrome.runtime.connect({
  name: process.env.VUE_APP_NAME,
});

let connected = true;
port.onDisconnect.addListener(() => {
  connected = false;
});

port.onMessage.addListener(async request => {
  const { action = null, data = {} } = request;
  console.log(request);
  const postMessage = (status, message) => {
    if (!connected) return;
    port.postMessage({
      status,
      message,
    });
  };

  switch (action) {
    case START_APP:
      try {
        if (window.location.origin !== process.env.VUE_APP_URL) {
          await startApp();
        }
      } catch (e) {
        postMessage(ERROR, e.message);
      }
      break;
    case REDIRECT_USER:
      if (window.location.origin !== process.env.VUE_APP_URL) {
        window.location.href = `${process.env.VUE_APP_URL}?source=extension&redirect=${window.location.href}`;
      }
      break;
    case UPDATE_AUTH_STATE:
      console.log('UPDATE_AUTH_STATE');
      console.log(data);
      try {
        await store.dispatch('setUser', data);
      } catch (e) {
        postMessage(ERROR, e.message);
      }
      break;
    default:
      break;
  }
});
