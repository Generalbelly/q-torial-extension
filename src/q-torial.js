import axios from 'axios'
import uuidv4 from 'uuid'
import './spaUrlWatcher'
import './driver.js/driver.min'
import './driver.js/sass/cdn.scss'

window.Qtorial =
  window.Qtorial ||
  (() => {
    const LOG_KEY = process.env.VUE_APP_NAME
    let log = {}
    let _key = null

    const retrieveLog = () => {
      try {
        const savedLog = JSON.parse(localStorage.getItem(LOG_KEY))
        return savedLog || {}
      } catch (e) {
        return false
      }
    }

    const saveLog = data => {
      try {
        log = {
          ...log,
          ...data,
        }
        localStorage.setItem(LOG_KEY, JSON.stringify(log))
        return log
      } catch (e) {
        return false
      }
    }

    const storePerfomance = async (data = {}) => {
      const URL = `https://us-central1-${process.env.VUE_APP_FIREBASE_PROJECT_ID}.cloudfunctions.net/storePerformance`
      return axios.post(URL, data)
    }

    const activateDriver = (tutorial, propertyId = null) => {
      let { once = [], EU_ID } = log

      const { name, settings, steps } = tutorial

      let step = 0
      let startTime = 0

      const EVENT_LABEL = name
      const GA_TRACKING_ID = propertyId
      const HIT_TYPE = 'event'
      const EVENT_CATEGORY = 'Tutorial'
      const EVENT_ACTION_COMPLETE = 'complete'
      const EVENT_ACTION_INCOMPLETE = 'incomplete'

      const driver = new Driver({
        animate: false,
        onNext() {
          step += 1
        },
        onPrevious() {
          step -= 1
        },
        async onReset() {
          if (settings.once) {
            if (!once.includes(tutorial.id)) {
              once = [...once, tutorial.id]
            }
            log = saveLog({
              once,
            })
          }

          await storePerfomance({
            key: _key,
            tutorialId: tutorial.id,
            completeSteps: step,
            allSteps: steps.length,
            complete: step === steps.length,
            elapsedTime: new Date().getTime() - startTime,
            euId: EU_ID,
          })

          if (!gtag || !GA_TRACKING_ID) return

          const eventField = {
            send_to: GA_TRACKING_ID,
            event_label: EVENT_LABEL,
            event_category: EVENT_CATEGORY,
            value: step,
            non_interaction: true,
          }

          if (step === steps.length) {
            gtag(HIT_TYPE, EVENT_ACTION_COMPLETE, eventField)
          } else {
            gtag(HIT_TYPE, EVENT_ACTION_INCOMPLETE, eventField)
          }
        },
      })
      const definedSteps = steps.map(s => ({
        element: s.highlightTarget,
        popover: s.config,
      }))
      driver.defineSteps(definedSteps)

      const firstStep = steps[0]
      const { trigger } = firstStep
      const { target, event, waitingTime } = trigger
      const handler = () => {
        window.setTimeout(() => {
          driver.start()
          startTime = new Date().getTime()
        }, waitingTime)
      }
      if (target === 'window') {
        handler()
      } else {
        document.querySelector(target).addEventListener(event, handler)
      }
    }

    const fetchTutorial = async (url, key) => {
      try {
        const URL = `https://us-central1-${process.env.VUE_APP_FIREBASE_PROJECT_ID}.cloudfunctions.net/getTutorial?key=${key}&url=${url}`
        const response = await axios.get(URL)
        const { tutorial = null, ga = null } = response.data

        if (!tutorial) return

        const { once = [] } = log

        const { steps = [], settings = {} } = tutorial

        if (
          steps.length > 0 &&
          (!settings.once || (settings.once && !once.includes(key)))
        ) {
          activateDriver(tutorial, ga ? ga.propertyId : null)
        }
      } catch (e) {
        console.log(e)
      }
    }

    return {
      init(key) {
        _key = key
        fetchTutorial(window.location.href, key)

        log = retrieveLog()

        if (!log.EU_ID) {
          const identifier = uuidv4()
          log = saveLog({
            EU_ID: identifier,
          })
        }

        window.parent.addEventListener('locationchange', () =>
          fetchTutorial(window.location.href, key)
        )
      },
    }
  })()
