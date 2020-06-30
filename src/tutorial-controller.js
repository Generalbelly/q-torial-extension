const ERROR_TRIGGER_NOT_FOUND = 'trigger element not found';
const ERROR_NO_ELEMENTS_FOUND = 'no elements are found';

export class StepError extends Error {
  stepIndex = 0;

  constructor(stepIndex, message) {
    super(message);
    this.stepIndex = stepIndex;
  }
}

const createController = (store, apiClient = null, gaClient = null) => {
  let driver = null;
  let currentTutorial = null;
  let steps = [];
  let startTime = 0;
  let activeStepIndex = 0;
  let intendedReload = store.get('intendedReload', false);
  let once = store.get('once', []);
  const customerId = store.get('customerId', null);
  let driverOptions = {};
  const pseudoDivId = 'q-torial-pseudo';

  if (!document.querySelector(`#${pseudoDivId}`)) {
    const divElement = document.createElement('div');
    // divElement.style.display = 'none';
    divElement.id = pseudoDivId;
    document.body.appendChild(divElement);
  }

  return {
    resetProgress() {
      store.set('intendedReload', false);
      store.set('activeStepIndex', -1);
      store.set('startTime', 0);
      store.set('tutorial', null);
    },
    saveProgress() {
      store.set('intendedReload', intendedReload);
      store.set('activeStepIndex', activeStepIndex);
      store.set('startTime', startTime);
      store.set('tutorial', currentTutorial);
    },
    hasTheSamePath(step, step2) {
      return step.pathValue === step2.pathValue;
    },
    reset(hard = false) {
      if (driver) {
        driver.reset();
      }
      this.resetProgress();
      if (hard) {
        store.clear();
      }
    },
    async nextHandler() {
      driver.preventMove();
      const nextStepIndex = activeStepIndex + 1;
      if (nextStepIndex === steps.length) {
        driver.moveNext();
        return;
      }
      const activeStep = steps[activeStepIndex];
      const nextStep = steps[nextStepIndex];
      const samePath = this.hasTheSamePath(nextStep, activeStep);
      activeStepIndex = nextStepIndex;
      if (samePath) {
        const { trigger } = nextStep;
        const { target, event, waitingTime } = trigger;
        if (target && event) {
          intendedReload = true;
          driver.reset();
          await this.prepare(currentTutorial, driverOptions);
          intendedReload = false;
        } else {
          window.setTimeout(() => {
            driver.moveNext();
          }, waitingTime);
        }
      } else {
        this.redirect(window.location.origin + nextStep.pathValue);
      }
    },
    previousHandler() {
      driver.preventMove();
      const prevStepIndex = activeStepIndex - 1;
      if (prevStepIndex === -1) {
        driver.movePrevious();
        return;
      }
      const activeStep = steps[activeStepIndex];
      const prevStep = steps[prevStepIndex];
      const samePath = this.hasTheSamePath(prevStep, activeStep);
      activeStepIndex = prevStepIndex;
      if (samePath) {
        driver.movePrevious();
      } else {
        this.redirect(window.location.origin + steps[prevStepIndex].pathValue);
      }
    },
    async resetHandler() {
      console.log('intendedReload', intendedReload);
      if (!intendedReload) {
        if (currentTutorial.settings.once) {
          if (!once.includes(currentTutorial.id)) {
            once = [...once, currentTutorial.id];
          }
          store.set('once', once);
        }

        const completeSteps = activeStepIndex + 1;
        if (apiClient) {
          await apiClient.storePerformance({
            tutorialId: currentTutorial.id,
            allSteps: steps.length,
            complete: completeSteps === steps.length,
            elapsedTime: new Date().getTime() - startTime,
            completeSteps,
            customerId,
          });
        }

        if (gaClient && currentTutorial.gaPropertyId) {
          const data = {
            send_to: currentTutorial.gaPropertyId,
            event_label: currentTutorial.name,
            event_category: 'Tutorial',
            value: completeSteps,
            non_interaction: true,
          };
          try {
            if (completeSteps === steps.length) {
              gaClient.store('complete', data);
            } else {
              gaClient.store('incomplete', data);
            }
          } catch (e) {
            if (e.toString() !== 'ReferenceError: gtag is not defined') {
              throw e;
            }
          }
        }
        this.resetProgress();
      } else {
        this.saveProgress();
        // window.removeEventListener('locationchange', this.saveProgress)
      }
    },
    redirect(url) {
      intendedReload = true;
      driver.reset();
      window.location.href = url;
    },
    validate(tutorial) {
      // chrom拡張からの呼び出し
      if (!apiClient) {
        return true;
      }
      return !(
        tutorial.steps.length === 0 ||
        tutorial.steps.filter(s => s.pathValue === window.location.pathname)
          .length === 0
      );
    },
    async handleError(error) {
      if (error instanceof StepError) {
        if (apiClient) {
          await apiClient.logError({
            tutorialId: currentTutorial.id,
            stepIndex: error.stepIndex,
            message: error.message,
          });
        }
      }
      this.reset();
    },
    async prepare(tutorial, options = {}) {
      try {
        intendedReload = false;
        if (!this.validate(tutorial)) {
          return;
        }
        driverOptions = options;
        activeStepIndex = store.get('activeStepIndex', 0);
        startTime = store.get('startTime', 0);
        currentTutorial = tutorial;
        steps = currentTutorial.steps.map(step => {
          if (step.pathValue === window.location.pathname) {
            return step;
          }
          return {
            ...step,
            highlightTarget: `#${pseudoDivId}`,
          };
        });
        driver = new Driver({
          ...driverOptions,
          animate: false,
          onNext: async () => {
            try {
              await this.nextHandler();
            } catch (error) {
              await this.handleError(error);
            }
          },
          onPrevious: async () => {
            try {
              this.previousHandler();
            } catch (error) {
              await this.handleError(error);
            }
          },
          onReset: driverOptions.onReset
            ? async () => {
                console.log('onResetCalled');
                try {
                  await this.resetHandler();
                  driverOptions.onReset(intendedReload);
                } catch (error) {
                  await this.handleError(error);
                }
              }
            : async () => {
                console.log('onResetCalled');
                try {
                  await this.resetHandler();
                } catch (error) {
                  await this.handleError(error);
                }
              },
        });
        const definedSteps = steps.map(s => ({
          element: s.highlightTarget,
          popover: s.config,
        }));

        const firstStep = steps[activeStepIndex];
        if (firstStep.pathValue !== window.location.pathname) {
          this.redirect(window.location.origin + firstStep.pathValue);
        }
        const { trigger, order, highlightTarget } = firstStep;
        const { target, event, waitingTime } = trigger;
        const handler = () => {
          window.setTimeout(() => {
            driver.start(order);
            startTime = new Date().getTime();
          }, waitingTime);
        };
        if (
          highlightTarget === 'modal' ||
          document.querySelector(highlightTarget)
        ) {
          driver.defineSteps(definedSteps);
          if (
            (target === 'window' && event === 'load') ||
            (target === null && event === null)
          ) {
            handler();
          } else {
            const el = document.querySelector(target);
            if (!el) {
              throw new StepError(activeStepIndex, ERROR_TRIGGER_NOT_FOUND);
            }
            el.addEventListener(
              event,
              e => {
                e.stopPropagation();
                handler();
              },
              {
                once: true,
              }
            );
          }
        } else {
          const targetNode = document.body;
          const config = { childList: true, subtree: true };
          let done = false;
          const mutationObserver = new MutationObserver(
            async (mutationsList, observer) => {
              if (!document.querySelector(highlightTarget)) return;
              driver.defineSteps(definedSteps);
              if (
                (target === 'window' && event === 'load') ||
                (target === null && event === null)
              ) {
                handler();
              } else {
                const el = document.querySelector(target);
                if (!el) {
                  throw new StepError(activeStepIndex, ERROR_TRIGGER_NOT_FOUND);
                }
                el.addEventListener(
                  event,
                  e => {
                    e.stopPropagation();
                    handler();
                  },
                  {
                    once: true,
                  }
                );
              }
              done = true;
              observer.disconnect();
            }
          );
          mutationObserver.observe(targetNode, config);
          window.setTimeout(async () => {
            if (!done) {
              mutationObserver.disconnect();
              throw new StepError(activeStepIndex, ERROR_NO_ELEMENTS_FOUND);
            }
          }, 10000);
        }
      } catch (error) {
        this.handleError(error);
      }
    },
  };
};

export default createController;
