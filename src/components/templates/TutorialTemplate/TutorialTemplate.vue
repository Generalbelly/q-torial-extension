<template>
  <div>
    <the-sidebar
      v-show="shouldShowSideNav"
      :class="shouldShowSideNavRight ? 'is-fixed-top-right' : 'is-fixed-top-left'"
      :is-on-right="shouldShowSideNavRight"
      @click:close="$emit('click:close')"
      @click:switch="shouldShowSideNavRight = !shouldShowSideNavRight"
    >
      <base-heading v-if="innerTutorial.id">
        {{ innerTutorial.name }}
      </base-heading>
      <div>
        <template v-if="innerTutorial.steps.length === 0">
          <p>
            You haven't added any steps yet.
          </p>
        </template>
        <template v-else>
          <template v-for="(step, stepIndex) in innerTutorial.steps">
            <div class="has-text-centered">
              <span class="step-wrapper has-background-grey has-cursor-pointer" @click="onStepClick(step)">
                <modal-icon v-if="step.type === 'modal'" />
                <tooltip-icon v-else-if="step.type === 'tooltip'" />
                <base-icon v-if="stepIndex !== innerTutorial.steps.length - 1" icon="arrow-down" />
              </span>
            </div>
          </template>
        </template>
        <div class="has-margin-top-5">
          <step-type-dropdown class="is-fullwidth" @click:step-type="onClickStepType" />
        </div>
      </div>
    </the-sidebar>
    <validation-observer ref="observer">
      <base-modal :active="shouldShowModal" :can-cancel="false" @click:close="shouldShowModal = false" @click:confirm="onClickConfirm" @click:cancel="onClickCancel">
        <validatable-text-field label="Tutorial Name" v-model="innerTutorial.name" placeholder="First timers" name="tutorial name" rules="required" />
        <textarea-field label="Tutorial Description" v-model="innerTutorial.description" placeholder="Tutorial for first time customers." name="tutorial description" />
        <div>
          <div class="label">
            Start this tutorial for a user visiting the following condition(s).
          </div>
          <base-columns>
            <base-column>
              <select-field :items="pathOperators" v-model="innerTutorial.pathOperator" />
            </base-column>
            <base-column>
              <validatable-text-field v-model="innerTutorial.pathValue" name="path value" rules="required" />
            </base-column>
          </base-columns>
          <base-columns>
            <base-column>
              <checkbox-field v-model="parametersRequired">
                with parameters
              </checkbox-field>
              <parameter-fields v-show="parametersRequired" v-model="innerTutorial.parameters" />
            </base-column>
          </base-columns>
          <base-columns>
            <base-column>
              <checkbox-field v-model="domainRequired"> Only apply for the domain ({{ domain }}) </checkbox-field>
            </base-column>
          </base-columns>
        </div>
      </base-modal>
    </validation-observer>
    <screen-overlay-layout v-if="showClickToAddStepMessage" @click="onCloseClickToAddStepMessage">
      <tips-message class="message-top-right" active @close="onCloseClickToAddStepMessage">
        Click to select and edit text.<br />
        Selections start small.<br />
        The more you click, the larger your section to edit will become.<br />
        To select a different small section, press cancel and click a new section.
      </tips-message>
    </screen-overlay-layout>
    <screen-overlay-layout v-if="showNoStepAddedYetMessage" @click="showNoStepAddedYetMessage = false">
      <warning-message class="is-fixed-top-right" active @close="showNoStepAddedYetMessage = false">
        You haven't added any steps yet.
      </warning-message>
    </screen-overlay-layout>
    <base-loading is-full-page :active="loading" />
  </div>
</template>
<script>
import Vue from 'vue';
import { ValidationObserver } from 'vee-validate';
import DriverEditor from '../../organisms/DriverEditor';
import TutorialEntity from '../../atoms/Entities/TutorialEntity';
import BaseHeading from '../../atoms/BaseHeading';
import { CANCEL, ADD, EDIT, PREVIEW, SAVE } from '../../../constants/drvier-editor-command-types';
import StepTypeDropdown from '../../organisms/StepTypeDropdown/StepTypeDropdown';
import BaseModal from '../../molecules/BaseModal/BaseModal';
import ValidatableTextField from '../../molecules/fields/ValidatableTextField';
import ValidatableTextareaField from '../../molecules/fields/ValidatableTextareaField';
import iframeStyler from '../../mixins/iframeStyler';
import ScreenOverlayLayout from '../../molecules/layouts/ScreenOverlayLayout';
import TipsMessage from '../../organisms/messages/TipsMessage';
import WarningMessage from '../../organisms/messages/WarningMessage';
import TheSidebar from '../../organisms/TheSidebar/TheSidebar';
import BaseColumn from '../../atoms/BaseColumn/BaseColumn';
import BaseColumns from '../../atoms/BaseColumns/BaseColumns';
import ParameterFields from '../../molecules/fields/ParameterFields';
import SelectField from '../../molecules/fields/SelectField';
import CheckboxField from '../../molecules/fields/CheckboxField';
import TextareaField from '../../molecules/fields/TextareaField/TextareaField';
import BaseLoading from '../../atoms/BaseLoading/BaseLoading';
import ModalIcon from '../../atoms/icons/ModalIcon/ModalIcon';
import TooltipIcon from '../../atoms/icons/TooltipIcon/TooltipIcon';
import BaseIcon from '../../atoms/BaseIcon/BaseIcon';
import StepEntity from '../../atoms/Entities/StepEntity';

const pathOperators = [
  {
    value: 'ALL',
    text: 'All the path names',
  },
  {
    value: 'EQUAL',
    text: 'A path name that is equal to',
  },
  {
    value: 'STARTS_WITH',
    text: 'Path names that starts with',
  },
  {
    value: 'ENDS_WITH',
    text: 'Path names that ends with',
  },
  {
    value: 'CONTAINS',
    text: 'Path names that contains',
  },
  {
    value: 'REGEX',
    text: 'Path names that matches the following regular expression: ',
  },
  {
    value: 'NOT_EQUAL',
    text: 'Path names that are not equal to',
  },
];
export default {
  name: 'TutorialTemplate',
  mixins: [iframeStyler],
  components: {
    BaseIcon,
    TooltipIcon,
    ModalIcon,
    BaseLoading,
    ValidationObserver,
    TextareaField,
    CheckboxField,
    SelectField,
    ParameterFields,
    BaseColumns,
    BaseColumn,
    TheSidebar,
    WarningMessage,
    TipsMessage,
    ScreenOverlayLayout,
    ValidatableTextareaField,
    ValidatableTextField,
    BaseModal,
    StepTypeDropdown,
    BaseHeading,
  },
  props: {
    tutorial: {
      type: Object,
      default: null,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      shouldShowSideNav: true,
      shouldShowSideNavRight: true,
      shouldShowModal: false,
      showClickToAddStepMessage: false,
      showNoStepAddedYetMessage: false,
      parametersRequired: false,
      domainRequired: false,
      pathOperators,
      innerTutorial: new TutorialEntity(),
      domain: window.parent.location.hostname,
      driverEditorID: `${process.env.VUE_APP_NAME}-editor`,
    };
  },
  watch: {
    tutorial: {
      immediate: true,
      handler(value) {
        if (value) {
          this.innerTutorial = value;
        }
      },
    },
    domainRequired: {
      handler(value) {
        if (value) {
          this.innerTutorial.domain = value ? window.parent.location.origin : null;
        }
      },
    },
    parametersRequired: {
      handler(value) {
        if (value && this.innerTutorial.parameters.length === 0) {
          this.innerTutorial.parameters = [
            {
              key: '',
              value: '',
            },
          ];
        }
      },
    },
  },
  created() {
    window.addEventListener('message', this.onReceiveMessage);
  },
  mounted() {
    if (!document.querySelector(`#${this.driverEditorID}`)) {
      const divElement = window.parent.document.createElement('div');
      divElement.id = this.driverEditorID;
      window.parent.document.body.appendChild(divElement);
      const vm = new Vue({
        render: h => h(DriverEditor),
      });
      vm.$mount(divElement);
    }
  },
  beforeDestroy() {
    window.removeEventListener('message', this.onReceiveMessage);
  },
  methods: {
    onReceiveMessage(event) {
      if (event.origin !== window.parent.location.origin) return;
      if (typeof event.data !== 'object' || Array.isArray(event.data)) return;
      const { app = null, command = null, data = {} } = event.data;
      if (app === process.env.VUE_APP_NAME) {
        this.handleCommand(command, data);
      }
    },
    handleCommand(command, data) {
      if (command === SAVE) {
        const index = this.innerTutorial.steps.findIndex(s => s.id === data.id);
        if (index === -1) {
          this.innerTutorial.steps = [...this.innerTutorial.steps, new StepEntity(data)];
        } else {
          this.innerTutorial.steps = [
            ...this.innerTutorial.steps.slice(0, index),
            new StepEntity({
              ...this.innerTutorial.steps[index],
              ...data,
            }),
            ...this.innerTutorial.steps.slice(index + 1),
          ];
        }
        if (!this.innerTutorial.id) {
          this.innerTutorial.pathValue = window.parent.location.pathname;
          this.shouldShowModal = true;
        } else {
          this.$emit('update:tutorial', this.innerTutorial);
          this.shouldShowSideNav = true;
        }
        this.showIframe();
      } else if (command === CANCEL) {
        this.shouldShowSideNav = true;
        this.showIframe();
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
    onClickStepType(stepType) {
      if (stepType === 'tooltip') {
        this.showClickToAddStepMessage = true;
      } else {
        this.hideIframe();
      }
      this.shouldShowSideNav = false;
      this.sendCommand(ADD, {
        type: stepType,
      });
    },
    onCloseClickToAddStepMessage() {
      this.showClickToAddStepMessage = false;
      this.hideIframe();
    },
    async onClickConfirm() {
      const valid = await this.$refs.observer.validate();
      if (valid) {
        this.$emit(
          'update:tutorial',
          new TutorialEntity({
            ...this.innerTutorial,
          })
        );
        this.shouldShowModal = false;
        this.shouldShowSideNav = true;
      }
    },
    onClickCancel() {
      this.shouldShowModal = false;
    },
    onStepClick(step) {
      this.hideIframe();
      this.shouldShowSideNav = false;
      this.sendCommand(EDIT, {
        step,
      });
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
>>> .message-top-right {
  position: absolute;
  top: 0;
  right: 0;
  left: unset;
}
>>> .message-top-left {
  position: absolute;
  top: 0;
  right: unset;
  left: 0;
}
.step-wrapper {
  display: inline-block;
  padding: 15px;
  border-radius: 50%;
}
.step-wrapper > svg {
  width: 45px;
}
</style>
