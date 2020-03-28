import axios from 'axios';
import uuidv4 from 'uuid';
import './spaUrlWatcher';
import createStore from './local-storage';
import createController from './tutorial-controller';
import './driver.js/driver.min';
import './driver.js/sass/q-torial.scss';

const ENDPOINT =
  'https://us-central1-{{FIREBAE_PROJECT_ID}}.cloudfunctions.net';
window.Qtorial =
  window.Qtorial ||
  (() => {
    const createApiClient = userKey => ({
      storePerformance: async (data = {}) =>
        axios.post(`${ENDPOINT}/storePerformance`, { ...data, key: userKey }),
      getTutorial: async (url, once) => {
        const response = await axios.post(`${ENDPOINT}/getTutorial`, {
          url,
          key: userKey,
          once,
        });
        return response.data || {};
      },
      logError: async (data = {}) => {
        await axios.post(`${ENDPOINT}/logError`, { ...data, key: userKey });
      },
    });

    const createGAClient = () => ({
      store(action, data) {
        if (!gtag) {
          return;
        }
        gtag('event', action, data);
      },
    });

    return {
      async init(key, customerId = null) {
        const store = createStore(process.env.VUE_APP_NAME);
        const storedCustomerId = store.get('customerId');
        if (!storedCustomerId || storedCustomerId !== customerId) {
          store.set('customerId', customerId || uuidv4());
        }
        const apiClient = createApiClient(key);
        const gaClient = createGAClient();
        const tutorialController = createController(store, apiClient, gaClient);
        const fetchTutorial = async () => {
          const currentTutorial = store.get('tutorial', null);
          if (currentTutorial) {
            await tutorialController.prepare(currentTutorial);
            return;
          }
          const activeStepIndex = store.get('activeStepIndex', -1);
          if (activeStepIndex === -1 && store.get('tutorial', null) === null) {
            const once = store.get('once', []);
            const { tutorial = null } = await apiClient.getTutorial(
              window.location.href,
              once
            );
            if (tutorial) {
              await tutorialController.prepare(tutorial);
            }
          }
        };
        await fetchTutorial();
        window.addEventListener('locationchange', fetchTutorial);
      },
    };
  })();
