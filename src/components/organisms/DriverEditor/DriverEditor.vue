<template>
  <div></div>
</template>

<script>
import finder from '@medv/finder';
import purify from 'dompurify';
import { ADD, EDIT, PREVIEW, SHOW_NO_STEP_ADDED_YET_MESSAGE, SAVE, CANCEL } from '../../../constants/drvier-editor-command-types';
import StepEntity from '../../atoms/Entities/StepEntity';

const MAX_RETRIES = 5;
export default {
  name: 'DriverEditor',
  // props: {
  //   steps: {
  //     type: Array,
  //     default() {
  //       return [];
  //     },
  //   },
  // },
  data() {
    return {
      driver: null,
      selectorChoices: [],
      selectorChoiceIndex: 0,
      step: new StepEntity(),
      // iframeEl: null,
      // shouldHideIframe: false,
      source: null,
      isEditing: false,
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
        this.$emit('editDone');
      }
    },
    // shouldHideIframe(value) {
    //   if (value) {
    //     this.iframeEl.style.display = 'none';
    //   } else {
    //     this.iframeEl.style.display = 'unset';
    //   }
    // },
  },
  created() {
    window.addEventListener('message', this.onReceiveMessage);
    this.driver = new Driver({
      animate: false,
    });
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
      if (command === ADD) {
        this.isEditing = true;
        const { type } = data;
        if (type === 'tooltip') {
          this.addUserScreenClickHandler();
        } else if (type === 'modal') {
          this.highlight();
        }
      } else if (command === EDIT) {
        const { step } = data;
        this.isEditing = true;
        this.step = step;
        this.highlight(step.highlightTarget, {
          content: step.config.content,
        });
      }
    },
    addUserScreenClickHandler() {
      document.querySelectorAll('body *').forEach(el => {
        if (el.tagName === 'A') {
          el.style.pointerEvents = 'none';
          el.style.cursor = 'default';
        }
        el.addEventListener('click', this.userScreenClickHandler);
      });
    },
    removeUserScreenClickHandler() {
      document.querySelectorAll('body *').forEach(el => {
        if (el.tagName === 'A') {
          el.style.pointerEvents = null;
          el.style.cursor = null;
        }
        el.removeEventListener('click', this.userScreenClickHandler);
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
      const activeElement = this.driver.getHighlightedElement();
      const popover = activeElement.getPopover();
      const content = purify.sanitize(popover.getContentNode().input);

      const activeNode = activeElement.getNode();
      const selector = this.getSelector(activeNode);
      return {
        element: selector,
        popover: {
          content,
        },
      };
    },
    onClickNext(el) {
      if (this.isEditing) {
        this.onClickSave(el);
      }
    },
    onClickPrevious(el) {
      if (this.isEditing) {
        this.onClickCancel(el);
      }
    },
    onClickCancel(el) {
      if (el !== 'modal') {
        this.removeUserScreenClickHandler();
      }
      this.isEditing = false;
      this.sendCommand(CANCEL);
    },
    onClickSave(el) {
      if (el !== 'modal') {
        this.removeUserScreenClickHandler();
      }
      this.isEditing = false;
      const { element, popover } = this.getDriverConfig();
      this.sendCommand(
        SAVE,
        new StepEntity({
          ...this.step,
          highlightTarget: element,
          type: element === 'modal' ? 'modal' : 'tooltip',
          config: popover,
        })
      );
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
      e.preventDefault(); // for driver.js
      e.stopPropagation(); // for driver.js

      if (this.selectorChoices.length === 0) {
        this.selectorChoices = this.extractSelectorChoices(e);
      }

      this.showDriverChoice();
    },
    async highlight(element = 'modal', popover = { content: '<div><h1>Title</h1><div>Description</div></div>' }) {
      console.log(element);
      console.log(popover);
      return new Promise(resolve => {
        // watchでセットすると遅いのでここでやってる
        this.driver.options.allowClose = false;
        this.driver.options.editable = true;
        this.driver.defineSteps([
          {
            element,
            popover: popover,
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
        this.driver.start();
        resolve(this.driver.hasHighlightedElement());
      });
    },
    preview() {
      if (this.steps.length === 0) {
        this.sendCommand(SHOW_NO_STEP_ADDED_YET_MESSAGE);
        return;
      }

      this.driver.options.allowClose = true;
      // this.driver.options.onReset = () => {};
      this.driver.defineSteps(this.steps);
      this.driver.start();
    },
    async showDriverChoice() {
      if (this.selectorChoices.length === 0) return;
      if (this.selectorChoiceIndex === this.selectorChoices.length - 1 || this.selectorChoiceIndex + 1 > MAX_RETRIES) {
        this.selectorChoiceIndex = 0;
      }
      const hasHighlightedElement = await this.highlight(this.selectorChoices[this.selectorChoiceIndex]);
      this.selectorChoiceIndex += 1;
      if (!hasHighlightedElement) {
        this.showDriverChoice();
      }
    },
  },
};
</script>

<style scoped></style>
