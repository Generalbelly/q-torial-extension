<template>
  <div></div>
</template>

<script>
import finder from '@medv/finder';
import purify from 'dompurify';
import {
  EDIT,
  PREVIEW,
  SHOW_STEP_EDITOR_OPTIONS,
  // SHOW_CLICK_TO_ADD_STEP_MESSAGE,
  SHOW_NO_STEP_ADDED_YET_MESSAGE,
  SAVE_STEP,
  CANCEL_EDITING,
} from '../../../constants/drvier-editor-comman-types';
import TutorialStepEntity from '../../atoms/Entities/TutorialStepEntity';

export default {
  name: 'DriverEditor',
  props: {
    steps: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      driver: null,
      selectorChoices: [],
      selectorChoiceIndex: 0,
      maxRetries: 5,
      step: new TutorialStepEntity(),
      iframeEl: null,
      shouldHideIframe: false,
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
        this.step = null;
        this.$emit('editDone');
      }
    },
    shouldHideIframe(value) {
      if (value) {
        this.iframeEl.style.display = 'none';
      } else {
        this.iframeEl.style.display = 'unset';
      }
    },
  },
  created() {
    window.addEventListener('message', this.onReceiveMessage);
    this.driver = new Driver({
      animate: false,
    });
  },
  mounted() {
    this.iframeEl = window.document.querySelector(`iframe#${process.env.VUE_APP_NAME}`);
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
      switch (command) {
        case EDIT:
          this.isEditing = true;
          this.addUserScreenClickHandler();
          break;
        case PREVIEW:
          break;
        default:
          break;
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
    getDriverArguments() {
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
    onNext(el) {
      if (this.isEditing) {
        this.onClickSave();
      }
    },
    onPrevious(el) {
      console.log('onPrevious');
      if (this.isEditing) {
        this.onClickCancel();
      }
    },
    onClickCancel() {
      this.removeUserScreenClickHandler();
      this.isEditing = false;
    },
    onClickSave() {
      const { element, popover } = this.getDriverArguments();
      this.sendCommand(
        SAVE_STEP,
        new TutorialStepEntity({
          ...this.step,
          trigger_target: element,
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
      // this.sendCommand(SHOW_CLICK_TO_ADD_STEP_MESSAGE);

      if (this.selectorChoices.length === 0) {
        this.selectorChoices = this.extractSelectorChoices(e);
      }

      this.showDriverChoice();
    },
    highlight({ id = null, element, popover = { content: '<div><h1>Title</h1><div>Description</div></div>' } }) {
      let _element = element;
      let _popover = popover;

      if (!this.step) {
        this.step = id ? this.steps.find(s => s.id === id) : this.steps.find(s => s.element === element);

        if (this.step) {
          _element = this.step.element;
          _popover = this.step.popover;
        }
      }

      // watchdeでセットすると遅いのでここでやってる
      this.driver.options.allowClose = false;
      this.driver.options.editable = true;

      this.driver.defineSteps([
        {
          element: _element,
          popover: _popover,
          onNext: el => {
            console.log('next');
            this.onNext(el);
            this.driver.preventMove();
          },
          onPrevious: el => {
            console.log('prev');
            this.onPrevious(el);
            this.driver.preventMove();
          },
        },
      ]);
      this.driver.start();
      const activeElement = this.driver.getHighlightedElement();
      this.sendCommand(SHOW_STEP_EDITOR_OPTIONS, activeElement.getCalculatedPosition());

      if (this.isEditing) {
        this.selectorChoiceIndex += 1;
      }
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
    showDriverChoice() {
      if (this.selectorChoices.length === 0) return;
      if (this.selectorChoiceIndex === this.selectorChoices.length - 1 || this.selectorChoiceIndex + 1 > this.maxRetries) {
        this.selectorChoiceIndex = 0;
      }
      this.highlight({
        element: this.selectorChoices[this.selectorChoiceIndex],
      });
    },
  },
};
</script>

<style scoped></style>
