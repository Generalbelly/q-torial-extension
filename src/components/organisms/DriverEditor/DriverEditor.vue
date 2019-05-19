<template>
  <div>
    <tips-message :active="hasClickToAddStepMessage && showClickToAddStepMessage">
      Click to select and edit text.
    </tips-message>

    <warning-message
      :active="showNoMoreSelectorChoicesMessage"
      @close="showNoMoreSelectorChoicesMessage = false"
    >
      Looks like we don't have any other options to show you.
    </warning-message>

    <tips-message
      :active="hasSelectorChoicesAvailableMessage && showSelectorChoicesAvailableMessage"
      @close="showSelectorChoicesAvailableMessage = false"
    >
      Selections start small.<br>
      The more you click, the larger your section to edit will become.<br>
      To select a different small section, press cancel and click a new section.
    </tips-message>

    <warning-message
      :active="showNoStepAddedYetMessage"
      @close="showNoStepAddedYetMessage = false"
    >
      You haven't added any steps yet.
    </warning-message>

    <div v-show="isEdit">
      <div class="has-padding-4 is-fixed-bottom-right editor-action">
        <save-button id="q-torial-adding-step-save" @click="onClickSave"></save-button>
        <cancel-button id="q-torial-adding-step-cancel" @click="onClickCancel"></cancel-button>
      </div>
    </div>
  </div>
</template>

<script>
import finder from '@medv/finder';
import purify from 'dompurify';
import SaveButton from '../../atoms/buttons/SaveButton';
import CancelButton from '../../atoms/buttons/CancelButton/CancelButton';
import TipsMessage from '../messages/TipsMessage/TipsMessage';
import WarningMessage from '../messages/WarningMessage/WarningMessage';
import {EDIT, PREVIEW, SHOW_STEP_EDITOR_OPTIONS} from '../../../constants/drvier-editor-comman-types';

export const states = {
  initial: 'initial',
  edit: 'edit',
  preview: 'preview',
};

export default {
  name: 'DriverEditor',
  components: {
    WarningMessage,
    TipsMessage,
    CancelButton,
    SaveButton,
  },
  props: {
    steps: {
      type: Array,
      default() {
        return [];
      },
    },
    hasSelectorChoicesAvailableMessage: {
      type: Boolean,
      default: true,
    },
    hasClickToAddStepMessage: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      driver: null,
      state: null,
      selectorChoices: [],
      selectorChoiceIndex: 0,
      maxRetries: 5,
      step: null,
      showNoMoreSelectorChoicesMessage: false,
      showSelectorChoicesAvailableMessage: false,
      showClickToAddStepMessage: false,
      showNoStepAddedYetMessage: false,
      isHighlightSelectionActive: false,
      // shouldHideIframe: false,
      source: null,
    };
  },
  computed: {
    isInitial() {
      return this.state === states.initial;
    },
    isEdit() {
      return this.state === states.edit;
    },
  },
  watch: {
    state(newValue, oldValue) {
      if (oldValue == states.preview) {
        this.$emit('previewDone');
      }

      if (oldValue === states.edit) {
        this.driver.reset();
        this.driver.options.allowClose = true;
        this.driver.options.editable = false;
        this.selectorChoices = [];
        this.selectorChoiceIndex = 0;
        this.step = null;
        this.$emit('editDone');
      }
    },
    isHighlightSelectionActive: {
      immediate: true,
      handler(value) {
        if (value) {
          this.showClickToAddStepMessage = true;
          this.updateState(states.initial);
        }
      },
    },
  },
  created() {
    this.driver = new Driver({
      animate: false,
    });
  },
  mounted() {
    this.iframeEl = window.document.querySelector(`iframe#${process.env.VUE_APP_NAME}`);
    window.addEventListener('message', this.onReceiveMessage);
  },
  destroyed() {
    this.driver = null;
    // this.removeUserScreenClickHandler();
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
      this.source.postMessage({
        app: process.env.VUE_APP_NAME,
        command,
        data,
      }, window.location.origin);
    },
    handleCommand(command, data) {
      switch (command) {
        case EDIT:
          // this.shouldHideIframe = true;
          this.isHighlightSelectionActive = true;
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
    updateState(state = null) {
      if (Object.values(states).includes(state)) {
        this.state = state;
      }
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
    createStep(element) {
      const popover = element.getPopover();
      const content = purify.sanitize(popover.getContentNode().input);

      const activeNode = element.getNode();
      const selector = this.getSelector(activeNode);
      return {
        element: selector,
        popover: {
          content,
        },
      };
    },
    onClickCancel() {
      this.$emit('cancelClick');
      this.updateState(states.initial);
    },
    onClickSave() {
      const activeElement = this.driver.getHighlightedElement();
      const updatedStep = this.createStep(activeElement);
      if (this.step) {
        this.$emit('saveClick', {
          ...this.step,
          ...updatedStep,
        });
      } else {
        this.$emit('saveClick', updatedStep);
      }
      this.updateState(states.initial);
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
      if (!this.isHighlightSelectionActive) return;
      e.preventDefault(); // for driver.js
      e.stopPropagation(); // for driver.js
      if (this.isEdit) {
        if (e.target.id === 'q-torial-adding-step-cancel' || e.target.id === 'q-torial-adding-step-save') return;
        if (this.selectorChoices.length > 0) {
          this.showAnotherChoice();
        }
      } else if (this.isInitial) {
        this.showClickToAddStepMessage = false;

        if (this.selectorChoices.length === 0) {
          this.selectorChoices = this.extractSelectorChoices(e);
        }

        const selector = this.selectorChoices[this.selectorChoiceIndex];
        this.highlight({
          element: selector,
        });

        this.showSelectorChoicesAvailableMessage = true;
      }
    },
    highlight({ id = null, element, popover = { content: '<div><h1>Title</h1><div>Description</div></div>' } }) {
      let _element = element;
      let _popover = popover;

      if (!this.step) {
        this.step = id
          ? this.steps.find(s => s.id === id) : this.steps.find(s => s.element === element);

        if (this.step) {
          _element = this.step.element;
          _popover = this.step.popover;
        }
      }

      if (!this.isEdit) {
        this.updateState(states.edit);
      }

      // watchdeでセットすると遅いのでここでやってる
      this.driver.options.allowClose = false;
      this.driver.options.editable = true;

      this.driver.highlight({
        element: _element,
        popover: _popover,
      });
      const activeElement = this.driver.getHighlightedElement();
      this.sendCommand(SHOW_STEP_EDITOR_OPTIONS, activeElement.getCalculatedPosition());

      if (this.isHighlightSelectionActive && this.isEdit) {
        this.selectorChoiceIndex += 1;
      }
    },
    preview() {
      if (this.steps.length === 0) {
        this.showNoStepAddedYetMessage = true;
        return;
      }

      this.driver.options.allowClose = true;
      this.driver.options.onReset = () => {
        this.updateState(states.initial);
      };
      this.driver.defineSteps(this.steps);
      this.driver.start();
      this.updateState(states.preview);
    },
    showAnotherChoice() {
      if (!this.isEdit) return;
      if (this.selectorChoiceIndex === this.selectorChoices.length - 1 || this.selectorChoiceIndex + 1 > this.maxRetries) {
        this.showNoMoreSelectorChoicesMessage = true;
        this.selectorChoiceIndex = 0;
      } else {
        this.highlight({
          element: this.selectorChoices[this.selectorChoiceIndex],
        });
      }
    },
  },
};
</script>

<style scoped>
.editor-action {
  height: 50px;
  z-index: 100004;
}
</style>
