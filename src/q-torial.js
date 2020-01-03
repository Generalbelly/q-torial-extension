import axios from 'axios'
import uuidv4 from 'uuid'
import './spaUrlWatcher'
import createStore from './local-storage'
import createController from './tutorial-controller'
import './driver.js/driver.min'
import './driver.js/sass/cdn.scss'

window.Qtorial =
  window.Qtorial ||
  (() => {
    const createApiClient = userKey => {
      return {
        storePerformance: async (data = {}) => {
          const URL = `${process.env.VUE_APP_CLOUD_FUNCTION_ENDPOINT}/storePerformance`
          return axios.post(URL, {
            ...data,
            key: userKey,
          })
        },
        getTutorial: async (url, once) => {
          try {
            const response = await axios.post(
              `${process.env.VUE_APP_CLOUD_FUNCTION_ENDPOINT}/getTutorial`,
              // process.env.VUE_APP_CLOUD_RUN_ENDPOINT,
              {
                url,
                key: userKey,
                once,
              }
            )
            return response.data
          } catch (e) {
            console.error(e)
            return {}
          }
        },
      }
    }

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
            tutorialController.prepare(currentTutorial)
            return
          }
          if (
            store.get('activeStep', -1) === -1 &&
            store.get('tutorial', null) === null
          ) {
            const once = store.get('once', [])
            const { tutorial = null } = await apiClient.getTutorial(
              window.location.href,
              once
            )
            if (tutorial) {
              tutorialController.prepare(tutorial)
            }
          }
        }
        await fetchTutorial()
        window.addEventListener('locationchange', fetchTutorial)
      },
    }
  })()
