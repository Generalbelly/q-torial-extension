// Fontawesome
import Vue from 'vue';
import Buefy from 'buefy';
import VeeValidate from 'vee-validate';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import '../sass/main.scss';
import './fontawesome';
import store from './store';
import App from './App';
import { SIGN_IN, SIGN_OUT, START_APP, REDIRECT_USER } from './constants/action-types';
import { OK, ERROR } from './constants/status-types';

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
  iframeId = 'q-torial';

  appId = 'q-app';

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
    iframe.id = this.iframeId;
    const self = this;
    iframe.onload = () => {
      const app = new Vue({
        render: h => h(App),
        store,
      });
      app.$mount(`iframe#${self.iframeId}>#${self.appId}`);
    };
    const divElement = document.createElement('div');
    divElement.id = this.appId;
    iframe.appendChild(divElement);
    document.body.appendChild(iframe);
  }

  start() {
    console.log('starting');
  }
}

let extApp = null;

async function start() {
  if (!extApp) {
    extApp = new ExtApp();
    extApp.init();
  }
  extApp.start();
}

chrome.runtime.onMessage.addListener(async (request={}, sender, sendResponse) => {
  console.log(request);
  const { app = null, action = null, data = {} } = request;
  if (app === process.env.VUE_APP_NAME) {
    switch (action) {
      case START_APP:
        try {
          await start();
          sendResponse({ status: OK });
        } catch (e) {
          sendResponse({ status: ERROR, message: e.message });
        }
        break;
      case REDIRECT_USER:
        window.location.href = `${process.env.VUE_APP_URL}?source=extension&redirect=${window.location.href}`;
        break;
      default:
        break;
    }
  }
  return true;
});

