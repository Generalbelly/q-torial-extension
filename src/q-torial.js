import axios from 'axios'
import uuidv4 from 'uuid'
import './driver.js/driver.min'
import './spaUrlWatcher'
import './driver.js/sass/main.scss'

window.Qtorial =
  window.Qtorial ||
  (() => {
    const LOG_KEY = process.env.VUE_APP_NAME
    let log = {}

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

    const activateDriver = (tutorial, propertyId = null) => {
      let { once = [] } = log

      const { name, steps } = tutorial

      let step = 0

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
        onReset() {
          if (tutorial.settings.once) {
            if (!once.includes(tutorial.id)) {
              once = [...once, tutorial.id]
            }
            log = saveLog({
              once,
            })
          }

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
      const definedSteps = steps.map(step => ({
        element: step.highlightTarget,
        popover: step.config,
      }))
      driver.defineSteps(definedSteps)
      driver.start()
    }

    const fetchTutorial = async (url, key) => {
      try {
        const URL = `https://us-central1-${process.env.VUE_APP_FIREBASE_PROJECT_ID}.cloudfunctions.net/getTutorial?key=${key}&url=${url}`
        const response = await axios.get(URL)
        const { tutorial = null, ga = null } = response.data

        if (!tutorial) return

        const { once = [] } = log

        const { steps = [] } = tutorial

        if (
          steps.length > 0 &&
          (!tutorial.settings.once ||
            (tutorial.settings.once && !once.includes(key)))
        ) {
          window.setTimeout(() => {
            activateDriver(tutorial, ga ? ga.propertyId : null)
          }, 1000)
        }
      } catch (e) {
        console.log(e)
      }
    }

    return {
      init(key) {
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
