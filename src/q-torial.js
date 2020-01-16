import axios from 'axios'
import uuidv4 from 'uuid'
import './spaUrlWatcher'
import createStore from './local-storage'
import createController from './tutorial-controller'
import './driver.js/driver.min'
import './driver.js/sass/q-torial.scss'

window.Qtorial =
  window.Qtorial ||
  (() => {
    const createApiClient = userKey => ({
      storePerformance: async (data = {}) => {
        return axios.post(
          `${process.env.VUE_APP_CLOUD_FUNCTION_ENDPOINT}/storePerformance`,
          { ...data, key: userKey }
        )
      },
      getTutorial: async (url, once) => {
        const response = await axios.post(
          `${process.env.VUE_APP_CLOUD_FUNCTION_ENDPOINT}/getTutorial`,
          // process.env.VUE_APP_CLOUD_RUN_ENDPOINT,
          {
            url,
            key: userKey,
            once,
          }
        )
        return response.data || {}
      },
      logError: async (data = {}) => {
        await axios.post(
          `${process.env.VUE_APP_CLOUD_FUNCTION_ENDPOINT}/logError`,
          { ...data, key: userKey }
        )
      },
    })

    const createGAClient = () => ({
      store(action, data) {
        if (!gtag) {
          return
        }
        gtag('event', action, data)
      },
    })

    return {
      async init(key) {
        const store = createStore(process.env.VUE_APP_NAME)
        if (!store.get('EU_ID')) {
          store.set('EU_ID', uuidv4())
        }
        const apiClient = createApiClient(key)
        const gaClient = createGAClient()
        const tutorialController = createController(store, apiClient, gaClient)
        const fetchTutorial = async () => {
          const currentTutorial = store.get('tutorial', null)
          if (currentTutorial) {
            await tutorialController.prepare(currentTutorial)
            return
          }
          if (
            store.get('activeStepIndex', -1) === -1 &&
            store.get('tutorial', null) === null
          ) {
            const once = store.get('once', [])
            const { tutorial = null } = await apiClient.getTutorial(
              window.location.href,
              once
            )
            if (tutorial) {
              await tutorialController.prepare(tutorial)
            }
          }
        }
        await fetchTutorial()
        window.addEventListener('locationchange', fetchTutorial)
      },
    }
  })()
