import { sendCommand } from './api'
import { ELEMENT_NOT_FOUND } from './constants/drvier-editor-command-types'

const createController = (store, apiClient = null, gaClient = null) => {
  let driver = null
  let currentTutorial = null
  let steps = []
  let settings = {}
  let startTime = 0
  let activeStep = 0
  let intendedReload = false
  let once = store.get('once', [])
  const EU_ID = store.get('EU_ID', null)
  return {
    resetProgress() {
      if (!intendedReload) {
        store.set('activeStep', -1)
        store.set('startTime', 0)
        store.set('tutorial', null)
      }
    },
    saveProgress() {
      store.set('activeStep', activeStep)
      store.set('startTime', startTime)
      store.set('tutorial', currentTutorial)
    },
    hasTheSamePath(step, step2) {
      return step.pathValue === step2.pathValue
    },
    next() {
      driver.preventMove()
      const nextStep = activeStep + 1
      if (nextStep === steps.length) {
        driver.moveNext()
        return
      }
      const samePath = this.hasTheSamePath(steps[nextStep], steps[activeStep])
      activeStep += 1
      if (samePath) {
        driver.moveNext()
      } else {
        this.redirect(window.location.origin + steps[nextStep].pathValue)
      }
    },
    prev() {
      driver.preventMove()
      const prevStep = activeStep - 1
      if (prevStep === -1) {
        driver.movePrevious()
        return
      }
      const samePath = this.hasTheSamePath(steps[prevStep], steps[activeStep])
      activeStep -= 1
      if (samePath) {
        driver.movePrevious()
      } else {
        this.redirect(window.location.origin + steps[prevStep].pathValue)
      }
    },
    async reset() {
      if (settings.once) {
        if (!once.includes(currentTutorial.id)) {
          once = [...once, currentTutorial.id]
        }
        store.set('once', once)
      }

      if (apiClient) {
        await apiClient.storePerformance({
          tutorialId: currentTutorial.id,
          completeSteps: activeStep,
          allSteps: steps.length,
          complete: activeStep === steps.length,
          elapsedTime: new Date().getTime() - startTime,
          euId: EU_ID,
        })
      }

      if (gaClient) {
        if (currentTutorial.gaPropertyId) {
          const data = {
            send_to: currentTutorial.gaPropertyId,
            event_label: currentTutorial.name,
            event_category: 'Tutorial',
            value: activeStep,
            non_interaction: true,
          }
          if (activeStep === steps.length) {
            gaClient.store('complete', data)
          } else {
            gaClient.store('incomplete', data)
          }
        }
      }
      window.removeEventListener('beforeunload', this.saveProgress)
      window.removeEventListener('locationchange', this.saveProgress)
      this.resetProgress()
    },
    redirect(url) {
      intendedReload = true
      window.location.href = url
    },
    setTutorial(t) {
      currentTutorial = t
      settings = { ...t.settings }
      let stepIndex = 0
      steps = t.steps.map(s => {
        if (s.pathValue === window.location.pathname) {
          const updatedStep = {
            ...s,
            stepIndex,
          }
          stepIndex += 1
          return updatedStep
        }
        return {
          ...s,
          stepIndex: -1,
        }
      })
    },
    validate(tutorial) {
      if (!apiClient) {
        return true
      }
      if (
        tutorial.steps.length === 0 ||
        tutorial.steps.filter(s => s.pathValue === window.location.pathname)
          .length === 0
      ) {
        return false
      }
      return !(tutorial.settings.once && once.includes(EU_ID))
    },
    reset() {
      store.clear()
    },
    prepare(tutorial, driverOptions = {}) {
      if (!this.validate(tutorial)) {
        return
      }
      this.setTutorial(tutorial)
      activeStep = store.get('activeStep', 0)
      startTime = store.get('startTime', 0)

      window.addEventListener('beforeunload', this.saveProgress)
      window.addEventListener('locationchange', this.saveProgress)

      driver = new Driver({
        ...driverOptions,
        animate: false,
        onNext: () => this.next(),
        onPrevious: () => this.prev(),
        onReset: driverOptions.onReset
          ? () => {
              this.reset()
              driverOptions.onReset()
            }
          : () => this.reset(),
      })

      const firstStep = steps[activeStep]
      if (firstStep.pathValue !== window.location.pathname) {
        this.redirect(window.location.origin + firstStep.pathValue)
      }
      const { trigger } = firstStep
      const { target, event, waitingTime } = trigger

      const handler = e => {
        if (e) {
          e.stopPropagation()
        }
        window.setTimeout(() => {
          try {
            driver.start(firstStep.stepIndex)
            startTime = new Date().getTime()
          } catch (e) {
            console.error(e)
          }
        }, waitingTime)
      }

      const definedSteps = steps.map(s => ({
        element: s.highlightTarget,
        popover: s.config,
      }))
      if (document.querySelector(firstStep.highlightTarget)) {
        driver.defineSteps(definedSteps)
        if (target === 'window' && event === 'load') {
          handler()
        } else {
          document.querySelector(target).addEventListener(event, handler)
        }
      } else {
        const targetNode = document.body
        const config = { childList: true, subtree: true }
        let done = false
        const mutationObserver = new MutationObserver(
          (mutationsList, observer) => {
            const ready = steps.every(s => {
              if (s.stepIndex !== -1) {
                return !!document.querySelector(s.highlightTarget)
              }
              return true
            })
            if (!ready) return
            driver.defineSteps(definedSteps)
            if (target === 'window' && event === 'load') {
              handler()
            } else {
              document.querySelector(target).addEventListener(event, handler)
            }
            done = true
          }
        )
        mutationObserver.observe(targetNode, config)
        window.setTimeout(() => {
          if (!done) {
            // TODO send error to cloud function
            console.error('elements are not found')
          }
          mutationObserver.disconnect()
        }, 3000)
      }
    },
  }
}

export default createController
