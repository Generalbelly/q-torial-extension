<template>
  <div>
    <base-heading v-if="innerTutorialEntity.id">
      {{ innerTutorialEntity.name }}
    </base-heading>
    <div>
      <p v-if="innerTutorialEntity.tutorialStepEntities.length === 0">
        You haven't added any steps yet.
      </p>
      <div class="has-margin-top-5">
        <step-type-dropdown class="is-fullwidth" @click:step-type="onClickStepType"></step-type-dropdown>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue';
import DriverEditor from '../../organisms/DriverEditor';
import TutorialEntity from '../../atoms/Entities/TutorialEntity';
import BaseHeading from '../../atoms/BaseHeading';
import AddButton from '../../atoms/buttons/AddButton';
import { EDIT, PREVIEW, SHOW_STEP_EDITOR_OPTIONS, SHOW_CLICK_TO_ADD_STEP_MESSAGE, SHOW_NO_STEP_ADDED_YET_MESSAGE, SAVE_STEP } from '../../../constants/drvier-editor-comman-types';
import TipsMessage from '../../organisms/messages/TipsMessage';
import WarningMessage from '../../organisms/messages/WarningMessage';
import StepTypeDropdown from '../../organisms/StepTypeDropdown/StepTypeDropdown';

export default {
  name: 'TutorialsTemplate',
  components: {
    StepTypeDropdown,
    WarningMessage,
    TipsMessage,
    AddButton,
    BaseHeading,
  },
  props: {
    tutorialEntities: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      innerTutorialEntity: new TutorialEntity(),
      showClickToAddStepMessage: false,
      showNoStepAddedYetMessage: false,
    };
  },
  created() {
    window.addEventListener('message', this.onReceiveMessage);
  },
  mounted() {
    const divElement = window.parent.document.createElement('div');
    divElement.id = `${process.env.VUE_APP_NAME}-editor`;
    window.parent.document.body.appendChild(divElement);
    const vm = new Vue({
      render: h => h(DriverEditor),
    });
    vm.$mount(divElement);
  },
  methods: {
    onReceiveMessage(e) {
      if (e.origin !== window.parent.location.origin) return;
      if (typeof e.data !== 'object' || Array.isArray(e.data)) return;
      const { app = null, command = null, data = {} } = e.data;
      if (app === process.env.VUE_APP_NAME) {
        this.handleCommand(command, data);
      }
    },
    sendCommand(command, data = {}) {
      window.parent.postMessage(
        {
          app: process.env.VUE_APP_NAME,
          command,
          data,
        },
        window.parent.location.origin
      );
    },
    handleCommand(command, data) {
      switch (command) {
        case SHOW_STEP_EDITOR_OPTIONS:
          // this.$emit('select:step-element', data);
          break;
        case SHOW_NO_STEP_ADDED_YET_MESSAGE:
          this.showNoStepAddedYetMessage = true;
          break;
        case SAVE_STEP:
          this.$emit('update:step-element', data);
          console.log(data);
          break;
        default:
          break;
      }
    },
    onAddStepClick() {
      this.sendCommand(EDIT);
    },
    onClickStepType(stepType) {
      this.$emit('click:step-type', stepType);
      if (stepType === 'tooltip') {
        this.sendCommand(EDIT);
      }
    },
    onStepClick(id) {
      // this.$refs.editor.highlight({ id });
      // this.updateState(states.editingStep);
      // this.$emit('stepClick', { id });
    },
    onDeleteStepClick(id) {
      // this.$emit('deleteStepClick', { id });
    },
    onPreviewClick() {
      // this.updateState(states.previewing);
      // this.$refs.editor.preview();
    },
  },
};
</script>
<style scoped>
>>> .dropdown.is-fullwidth {
  display: flex;
}
>>> .dropdown.is-fullwidth .dropdown-trigger,
>>> .dropdown.is-fullwidth .button.is-primary {
  width: 100%;
}
</style>
