<template>
  <div>
    <base-heading>
      {{ innerTutorialEntity.id ? innerTutorialEntity.name : 'New Tutorial' }}
    </base-heading>
    <div>
      <add-button class="is-fullwidth" @click="onAddStepClick" />
    </div>
  </div>
</template>
<script>
import Vue from 'vue';
import DriverEditor from '../../organisms/DriverEditor';
import TutorialEntity from '../../atoms/Entities/TutorialEntity';
import BaseHeading from '../../atoms/BaseHeading/BaseHeading';
import AddButton from '../../atoms/buttons/AddButton/AddButton';
import {
  EDIT,
  PREVIEW,
  SHOW_STEP_EDITOR_OPTIONS
} from '../../../constants/drvier-editor-comman-types';

export default {
  name: 'TutorialsTemplate',
  components: {
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
    };
  },
  mounted() {
    window.addEventListener('message', this.onReceiveMessage);
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
      window.parent.postMessage({
        app: process.env.VUE_APP_NAME,
        command,
        data,
      }, window.parent.location.origin);
    },
    handleCommand(command, data) {
      switch (command) {
        case SHOW_STEP_EDITOR_OPTIONS:
          this.$emit('select:step-element', data);
          break;
        default:
          break;
      }
    },
    onAddStepClick() {
      console.log('sendCommand');
      this.sendCommand(EDIT);
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

</style>
