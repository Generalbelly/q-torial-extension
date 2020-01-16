const ERROR_TRIGGER_NOT_FOUND = 'trigger element not found'
const ERROR_NO_ELEMENTS_FOUND = 'no elements are found'

export class StepError extends Error {
  stepIndex = 0
  constructor(stepIndex, message) {
    super(message)
    this.stepIndex = stepIndex
  }
}

const createController = (store, apiClient = null, gaClient = null) => {
  let driver = null
  let currentTutorial = null
  let steps = []
  let settings = {}
  let startTime = 0
  let activeStepIndex = 0
  let intendedReload = false
  let once = store.get('once', [])
  const EU_ID = store.get('EU_ID', null)
  let driverOptions = {}

  return {
    resetProgress() {
      store.set('activeStepIndex', -1)
      store.set('startTime', 0)
      store.set('tutorial', null)
    },
    saveProgress() {
      store.set('activeStepIndex', activeStepIndex)
      store.set('startTime', startTime)
      store.set('tutorial', currentTutorial)
    },
    hasTheSamePath(step, step2) {
      return step.pathValue === step2.pathValue
    },
    reset(hard = false) {
      if (driver) {
        driver.reset()
      }
      this.resetProgress()
      if (hard) {
        store.clear()
      }
    },
    async nextHandler() {
      driver.preventMove()
      const nextStepIndex = activeStepIndex + 1
      if (nextStepIndex === steps.length) {
        driver.moveNext()
        return
      }
      const activeStep = steps[activeStepIndex]
      const nextStep = steps[nextStepIndex]
      const samePath = this.hasTheSamePath(nextStep, activeStep)
      activeStepIndex = nextStepIndex
      if (samePath) {
        const { trigger } = nextStep
        const { target, event, waitingTime } = trigger
        if (target && event) {
          intendedReload = true
          driver.reset()
          await this.prepare(currentTutorial, driverOptions)
          intendedReload = false
        } else {
          window.setTimeout(() => {
            driver.moveNext()
          }, waitingTime)
        }
      } else {
        this.redirect(window.location.origin + nextStep.pathValue)
      }
    },
    previousHandler() {
      driver.preventMove()
      const prevStepIndex = activeStepIndex - 1
      if (prevStepIndex === -1) {
        driver.movePrevious()
        return
      }
      const samePath = this.hasTheSamePath(
        steps[prevStepIndex],
        steps[activeStepIndex]
      )
      activeStepIndex = prevStepIndex
      if (samePath) {
        driver.movePrevious()
      } else {
        this.redirect(window.location.origin + steps[prevStepIndex].pathValue)
      }
    },
    async resetHandler() {
      if (!intendedReload) {
        if (settings.once) {
          if (!once.includes(currentTutorial.id)) {
            once = [...once, currentTutorial.id]
          }
          store.set('once', once)
        }

        if (apiClient) {
          await apiClient.storePerformance({
            tutorialId: currentTutorial.id,
            completeSteps: activeStepIndex,
            allSteps: steps.length,
            complete: activeStepIndex === steps.length,
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
              value: activeStepIndex,
              non_interaction: true,
            }
            if (activeStepIndex === steps.length) {
              gaClient.store('complete', data)
            } else {
              gaClient.store('incomplete', data)
            }
          }
        }
        this.resetProgress()
      } else {
        this.saveProgress()
        //window.removeEventListener('locationchange', this.saveProgress)
      }
    },
    redirect(url) {
      intendedReload = true
      driver.reset()
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
    async handleError(error) {
      console.error(error)
      if (error instanceof StepError) {
        if (apiClient) {
          await apiClient.logError({
            tutorialId: currentTutorial.id,
            stepIndex: error.stepIndex,
            message: error.message,
          })
        }
      }
      this.reset()
    },
    async prepare(tutorial, options = {}) {
      try {
        if (!this.validate(tutorial)) {
          return
        }
        this.setTutorial(tutorial)
        driverOptions = options
        activeStepIndex = store.get('activeStepIndex', 0)
        startTime = store.get('startTime', 0)
        //window.addEventListener('locationchange', this.saveProgress)

        driver = new Driver({
          ...driverOptions,
          animate: false,
          onNext: async () => {
            try {
              await this.nextHandler()
            } catch (error) {
              await this.handleError(error)
            }
          },
          onPrevious: async () => {
            try {
              this.previousHandler()
            } catch (error) {
              await this.handleError(error)
            }
          },
          onReset: driverOptions.onReset
            ? async () => {
                try {
                  await this.resetHandler()
                  driverOptions.onReset(intendedReload)
                } catch (error) {
                  await this.handleError(error)
                }
              }
            : async () => {
                try {
                  await this.resetHandler()
                } catch (error) {
                  await this.handleError(error)
                }
              },
        })

        const firstStep = steps[activeStepIndex]
        if (firstStep.pathValue !== window.location.pathname) {
          this.redirect(window.location.origin + firstStep.pathValue)
        }
        const { trigger } = firstStep
        const { target, event, waitingTime } = trigger

        const handler = () => {
          window.setTimeout(() => {
            driver.start(firstStep.stepIndex)
            startTime = new Date().getTime()
          }, waitingTime)
        }

        const definedSteps = steps.map(s => ({
          element: s.highlightTarget,
          popover: s.config,
        }))
        if (
          firstStep.highlightTarget === 'modal' ||
          document.querySelector(firstStep.highlightTarget)
        ) {
          driver.defineSteps(definedSteps)
          if (
            (target === 'window' && event === 'load') ||
            (target === null && event === null)
          ) {
            handler()
          } else {
            const el = document.querySelector(target)
            if (!el) {
              throw new StepError(activeStepIndex, ERROR_TRIGGER_NOT_FOUND)
            }
            el.addEventListener(
              event,
              e => {
                e.stopPropagation()
                handler()
              },
              {
                once: true,
              }
            )
          }
        } else {
          const targetNode = document.body
          const config = { childList: true, subtree: true }
          let done = false
          const mutationObserver = new MutationObserver(
            async (mutationsList, observer) => {
              // const ready = steps.every(s => {
              //   if (s.stepIndex !== -1) {
              //     return !!document.querySelector(s.highlightTarget)
              //   }
              //   return true
              // })
              // if (!ready) return
              if (!document.querySelector(firstStep.highlightTarget)) return
              driver.defineSteps(definedSteps)
              if (
                (target === 'window' && event === 'load') ||
                (target === null && event === null)
              ) {
                handler()
              } else {
                const el = document.querySelector(target)
                if (!el) {
                  throw new StepError(activeStepIndex, ERROR_TRIGGER_NOT_FOUND)
                }
                el.addEventListener(
                  event,
                  e => {
                    e.stopPropagation()
                    handler()
                  },
                  {
                    once: true,
                  }
                )
              }
              done = true
              observer.disconnect()
            }
          )
          mutationObserver.observe(targetNode, config)
          window.setTimeout(async () => {
            if (!done) {
              mutationObserver.disconnect()
              throw new StepError(activeStepIndex, ERROR_NO_ELEMENTS_FOUND)
            }
          }, 10000)
        }
      } catch (error) {
        this.handleError(error)
      }
    },
  }
}

export default createController
