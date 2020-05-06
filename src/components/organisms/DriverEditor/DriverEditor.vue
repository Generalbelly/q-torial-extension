<template>
  <div>
    <div
      v-if="
        (isReSelectingHighlightTarget || isSelectingTriggerTarget) &&
          selectorChoices.length > 0
      "
      class="is-fixed-bottom-right"
      style="z-index: 10000000000000;"
    >
      <button class="button" id="selecting-trigger-target-cancel">
        Cancel
      </button>
      <button class="button is-primary" id="selecting-trigger-target-select">
        Select
      </button>
    </div>
  </div>
</template>

<script>
import finder from '@medv/finder';
import purify from 'dompurify';
import {
  ADD,
  EDIT,
  PREVIEW,
  PREVIEW_DONE,
  SAVE,
  CANCEL,
  ELEMENT_NOT_FOUND,
  RESELECT_ELEMENT,
  RESET_PREVIEW,
  SELECT_TRIGGER_TARGET,
} from '../../../constants/drvier-editor-command-types';
import StepEntity from '../../atoms/Entities/StepEntity';
import { sendCommand } from '../../../api';
import createStore from '../../../local-storage';
import createController from '../../../tutorial-controller';
import TutorialEntity from '../../atoms/Entities/TutorialEntity';

const MAX_RETRIES = 5;
export default {
  name: 'DriverEditor',
  data() {
    return {
      driver: null,
      selectorChoices: [],
      selectorChoiceIndex: 0,
      step: new StepEntity(),
      source: null,
      isEditing: false,
      isSelectingTriggerTarget: false,
      isReSelectingHighlightTarget: false,
      previewController: null,
      localStorage: null,
    };
  },
  watch: {
    isEditing(value) {
      if (!value) {
        this.driver.reset();
        this.driver.options.allowClose = true;
        this.driver.options.editable = false;
        this.selectorChoices = [];
        this.selectorChoiceIndex = 0;
        this.step = new StepEntity();
      }
    },
    isSelectingTriggerTarget(value) {
      if (!value) {
        this.driver.reset();
        this.driver.options.allowClose = true;
        this.driver.options.editable = false;
        this.selectorChoices = [];
        this.selectorChoiceIndex = 0;
        this.step = new StepEntity();
      }
    },
    isReSelectingHighlightTarget(value) {
      if (!value) {
        this.driver.reset();
        this.driver.options.allowClose = true;
        this.driver.options.editable = false;
        this.selectorChoices = [];
        this.selectorChoiceIndex = 0;
        this.step = new StepEntity();
      }
    },
  },
  created() {
    window.addEventListener('message', this.onReceiveMessage);
    this.driver = new Driver({
      animate: false,
    });
    this.localStorage = createStore(`${process.env.VUE_APP_NAME}-extension`);
    this.previewController = createController(this.localStorage);
  },
  beforeDestroy() {
    window.removeEventListener('message', this.onReceiveMessage);
  },
  destroyed() {
    this.driver = null;
  },
  methods: {
    onReceiveMessage(e) {
      if (e.origin !== window.location.origin) return;
      if (typeof e.data !== 'object' || Array.isArray(e.data)) return;
      const { app = null, command = null, data = {} } = e.data;
      if (app === process.env.VUE_APP_NAME) {
        this.handleCommand(command, data);
        this.source = e.source;
      }
    },
    sendCommand(command, data = {}) {
      if (!this.source) return;
      this.source.postMessage(
        {
          app: process.env.VUE_APP_NAME,
          command,
          data,
        },
        window.location.origin
      );
    },
    handleCommand(command, data) {
      const { step = {}, steps = [], type = null } = data;
      console.log(command);
      console.log(data);
      if (command === ADD) {
        this.selectElementToHighlight(type);
        return;
      }
      if (command === SELECT_TRIGGER_TARGET) {
        this.isSelectingTriggerTarget = true;
        this.step = new StepEntity(step);
        this.addUserScreenClickHandler();
        return;
      }
      if (command === RESELECT_ELEMENT) {
        this.isReSelectingHighlightTarget = true;
        this.step = new StepEntity(step);
        this.addUserScreenClickHandler();
        return;
      }

      if (command === EDIT) {
        this.isEditing = true;
        this.step = new StepEntity(step);
        if (
          step.highlightTarget === 'modal' ||
          document.querySelector(step.highlightTarget)
        ) {
          this.highlight(step.highlightTarget, step.config);
        } else {
          const targetNode = document.body;
          const config = { childList: true, subtree: true };
          let done = false;
          const mutationObserver = new MutationObserver(
            (mutationsList, observer) => {
              if (document.querySelector(step.highlightTarget)) {
                this.highlight(step.highlightTarget, step.config);
                done = true;
                observer.disconnect();
              }
            }
          );
          mutationObserver.observe(targetNode, config);
          window.setTimeout(() => {
            if (!done) {
              this.isEditing = false;
              sendCommand(ELEMENT_NOT_FOUND);
              mutationObserver.disconnect();
            }
          }, 3000);
        }
        return;
      }

      if (command === PREVIEW) {
        this.preview(steps);
        return;
      }

      if (command === RESET_PREVIEW) {
        this.resetPreview();
      }
    },
    selectElementToHighlight(type = 'modal') {
      this.isEditing = true;
      this.addUserScreenClickHandler();
      if (type === 'modal') {
        this.highlight();
      }
    },
    addUserScreenClickHandler() {
      document.querySelectorAll('body *').forEach(el => {
        if (el.tagName === 'A') {
          el.style.pointerEvents = 'none';
          el.style.cursor = 'default';
        }
        el.addEventListener('click', this.userScreenClickHandler, true);
      });
    },
    removeUserScreenClickHandler() {
      document.querySelectorAll('body *').forEach(el => {
        if (el.tagName === 'A') {
          el.style.pointerEvents = null;
          el.style.cursor = null;
        }
        el.removeEventListener('click', this.userScreenClickHandler, true);
      });
    },
    getSelector(node) {
      if (node === 'modal') {
        return node;
      }
      if (node) {
        return finder(node, {
          root: document.body,
          id: name => !name.includes('driver-'),
          className: name => !name.includes('driver-'),
          tagName: () => true,
          seedMinLength: 5,
          optimizedMinLength: 4,
          threshold: 1000,
        });
      }
      return null;
    },
    getDriverConfig() {
      let content = '';
      let selector = '';
      const activeElement = this.driver.getHighlightedElement();
      const activeNode = activeElement.getNode();
      selector = this.getSelector(activeNode);
      const popover = activeElement.getPopover();
      if (popover) {
        content = purify.sanitize(popover.getContentNode().input);
      }
      return {
        element: selector,
        popover: {
          nextBtnText: 'Next',
          prevBtnText: 'Previous',
          showButtons: true,
          doneBtnText: 'Done',
          closeBtnText: 'Close',
          content,
        },
      };
    },
    onClickNext(el) {
      if (
        this.isEditing ||
        this.isSelectingTriggerTarget ||
        this.isReSelectingHighlightTarget
      ) {
        this.onClickSave(el);
      }
    },
    onClickPrevious(el) {
      if (
        this.isEditing ||
        this.isSelectingTriggerTarget ||
        this.isReSelectingHighlightTarget
      ) {
        this.onClickCancel(el);
      }
    },
    onClickCancel(el) {
      this.removeUserScreenClickHandler();
      this.isEditing = false;
      this.isSelectingTriggerTarget = false;
      this.isReSelectingHighlightTarget = false;
      this.sendCommand(CANCEL);
    },
    onClickSave(el) {
      this.removeUserScreenClickHandler();
      const { element, popover } = this.getDriverConfig();
      if (this.isEditing) {
        this.sendCommand(
          SAVE,
          new StepEntity({
            ...this.step,
            highlightTarget: element,
            type: element === 'modal' ? 'modal' : 'tooltip',
            config: popover,
          })
        );
      } else if (this.isSelectingTriggerTarget) {
        this.sendCommand(
          SAVE,
          new StepEntity({
            ...this.step,
            trigger: {
              ...this.step.trigger,
              target: element,
            },
          })
        );
      } else if (this.isReSelectingHighlightTarget) {
        console.log(this.step);
        this.sendCommand(
          SAVE,
          new StepEntity({
            ...this.step,
            highlightTarget: element,
          })
        );
      }
      this.isEditing = false;
      this.isSelectingTriggerTarget = false;
      this.isReSelectingHighlightTarget = false;
    },
    extractSelectorChoices(e) {
      const upperElements = [];
      const lowerElements = [];
      e.composedPath().find((el, index) => {
        if (el.tagName.toLowerCase() === 'body') return true;
        const selector = this.getSelector(el);
        upperElements.push(selector);
        if (index === 0) {
          Array.from(el.children).forEach(childEl => {
            const selector = this.getSelector(childEl);
            lowerElements.push(selector);
          });
        }
        return false;
      });

      return [...lowerElements, ...upperElements];
    },
    userScreenClickHandler(e) {
      e.stopPropagation(); // for driver.js
      if (e.target.id === 'selecting-trigger-target-cancel') {
        this.onClickPrevious();
        return;
      }
      if (e.target.id === 'selecting-trigger-target-select') {
        this.onClickNext();
        return;
      }

      if (
        this.isEditing ||
        this.isSelectingTriggerTarget ||
        this.isReSelectingHighlightTarget
      ) {
        if (this.selectorChoices.length === 0) {
          this.selectorChoices = this.extractSelectorChoices(e);
        }
        this.showDriverChoice();
      }
    },
    async highlight(
      element = 'modal',
      popover = { content: '<div><h1>Title</h1><div>Description</div></div>' }
    ) {
      return new Promise(resolve => {
        // watchでセットすると遅いのでここでやってる
        this.driver.options.allowClose = false;
        if (
          this.isSelectingTriggerTarget ||
          this.isReSelectingHighlightTarget
        ) {
          this.driver.defineSteps([
            {
              element,
              popover: {
                content: '',
              },
            },
          ]);
        } else {
          this.driver.options.editable = true;
          this.driver.defineSteps([
            {
              element,
              popover,
              onNext: el => {
                this.onClickNext(el);
                this.driver.preventMove();
              },
              onPrevious: el => {
                this.onClickPrevious(el);
                this.driver.preventMove();
              },
            },
          ]);
        }
        this.driver.start();
        resolve(this.driver.hasHighlightedElement());
      });
    },
    resetPreview() {
      this.previewController.reset(true);
    },
    preview(steps = []) {
      this.previewController.prepare(
        new TutorialEntity({
          steps,
        }),
        {
          allowClose: true,
          onReset: intendedReload => {
            if (!intendedReload) {
              this.sendCommand(PREVIEW_DONE);
            }
          },
        }
      );
    },
    async showDriverChoice() {
      if (this.selectorChoices.length === 0) return;
      if (
        this.selectorChoiceIndex === this.selectorChoices.length - 1 ||
        this.selectorChoiceIndex + 1 > MAX_RETRIES
      ) {
        this.selectorChoiceIndex = 0;
      } else {
        this.selectorChoiceIndex += 1;
      }
      await this.highlight(this.selectorChoices[this.selectorChoiceIndex]);
    },
  },
};
</script>

<style scoped></style>
