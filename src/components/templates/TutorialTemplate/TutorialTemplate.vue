<template>
  <div>
    <the-sidebar
      v-show="shouldShowSideNav"
      :class="
        shouldShowSideNavRight ? 'is-fixed-top-right' : 'is-fixed-top-left'
      "
      style="overflow-y: auto;"
      :is-on-right="shouldShowSideNavRight"
      @click:close="$emit('click:close')"
      @click:switch="shouldShowSideNavRight = !shouldShowSideNavRight"
    >
      <div v-if="innerTutorial.id" @click="shouldShowTutorialForm = true">
        <base-tooltip
          label="Click to edit tutorial settings"
          type="is-neutral-050"
        >
          <base-heading>
            {{ innerTutorial.name }}
          </base-heading>
        </base-tooltip>
      </div>
      <div class="step-definition has-margin-top-5">
        <p v-if="innerTutorial.steps.length === 0" class="has-text-centered">
          You haven't added any steps yet.
          <add-step-button
            class="has-margin-5"
            @click:step-type="onClickStepType"
          />
        </p>
        <template v-for="(step, stepIndex) in innerTutorial.steps">
          <span
            :key="`step-${stepIndex}`"
            class="step-definition__step has-background-grey has-cursor-pointer"
            @click="onStepClick(step)"
            @mouseenter="activeStepIndex = stepIndex"
          >
            <modal-icon v-if="step.type === 'modal'" />
            <tooltip-icon v-else-if="step.type === 'tooltip'" />
            <base-fade-transition-group>
              <add-step-button
                key="prepend"
                v-if="activeStepIndex === stepIndex"
                class="step-definition__prepend"
                @click.native.stop="newStepIndex = stepIndex"
                @click:step-type="onClickStepType"
              />
              <trash-button
                key="trash"
                v-show="activeStepIndex === stepIndex"
                class="step-definition__delete is-neutral-100"
                @click.stop="onStepDeleteClick(step)"
              />
              <pen-button
                key="pen"
                v-show="activeStepIndex === stepIndex"
                class="step-definition__edit is-neutral-100"
                @click.stop="onStepEditClick(step)"
              />
              <arrow-icon
                key="arrow"
                v-if="stepIndex < innerTutorial.steps.length - 1"
                class="step-definition__arrow"
              />
              <add-step-button
                key="append"
                v-if="
                  stepIndex === innerTutorial.steps.length - 1 ||
                    activeStepIndex === stepIndex
                "
                class="step-definition__add"
                @click.native.stop="newStepIndex = stepIndex + 1"
                @click:step-type="onClickStepType"
              />
            </base-fade-transition-group>
          </span>
        </template>
        <div class="step-definition__step step-definition__actions buttons">
          <preview-button
            v-if="innerTutorial.steps.length > 0"
            class="is-fullwidth is-accent-300"
            @click="onPreviewClick"
            outlined
          />
          <navigate-button
            class="is-fullwidth is-text"
            @click="onNavigateClick"
          />
        </div>
      </div>
    </the-sidebar>
    <base-modal
      :active="shouldShowTutorialForm"
      :can-cancel="false"
      @click:close="shouldShowTutorialForm = false"
      @click:confirm="onClickTutorialConfirm"
      @click:cancel="shouldShowTutorialForm = false"
    >
      <template v-slot:content>
        <validation-observer ref="tutorialForm">
          <tutorial-form
            :id="innerTutorial.id"
            :name.sync="innerTutorial.name"
            :description.sync="innerTutorial.description"
            :path-value.sync="innerTutorial.pathValue"
            :path-operator.sync="innerTutorial.pathOperator"
            :parameters.sync="innerTutorial.parameters"
            :domain.sync="innerTutorial.domain"
          />
        </validation-observer>
      </template>
    </base-modal>
    <base-modal
      :active="shouldShowUrlPathForm"
      :can-cancel="false"
      @click:cancel="onUrlPathFormCancel"
    >
      <template v-slot:content>
        <validation-observer key="urlPathForm" ref="urlPathForm">
          <url-path-form
            type="step"
            :url-path.sync="urlPath"
            :path-operator="innerStep.pathOperator"
            :path-value="innerStep.pathValue"
          />
        </validation-observer>
      </template>
      <template v-slot:primary-action-button>
        <go-button @click="onClickGo" />
      </template>
    </base-modal>
    <base-modal
      :active="shouldShowStepForm"
      :can-cancel="false"
      @click:close="shouldShowStepForm = false"
      @click:confirm="onClickStepConfirm"
      @click:cancel="shouldShowStepForm = false"
    >
      <template v-slot:content>
        <validation-observer ref="stepForm">
          <step-form
            :path-value.sync="innerStep.pathValue"
            :path-operator.sync="innerStep.pathOperator"
            :parameters.sync="innerStep.parameters"
          />
        </validation-observer>
      </template>
    </base-modal>
    <screen-overlay-layout
      v-if="showClickToAddStepMessage"
      @click="onCloseClickToAddStepMessage"
    >
      <tips-message
        class="message-top-right"
        active
        @close="onCloseClickToAddStepMessage"
      >
        Click to select and edit text.<br />
        Selections start small.<br />
        The more you click, the larger your section to edit will become.<br />
        To select a different small section, press cancel and click a new
        section.
      </tips-message>
    </screen-overlay-layout>
    <screen-overlay-layout
      v-if="showNoStepAddedYetMessage"
      @click="showNoStepAddedYetMessage = false"
    >
      <warning-message
        class="is-fixed-top-right"
        active
        @close="showNoStepAddedYetMessage = false"
      >
        You haven't added any steps yet.
      </warning-message>
    </screen-overlay-layout>
    <base-loading is-full-page :active="loading" />
  </div>
</template>
<script>
import Vue from 'vue'
import { ValidationObserver } from 'vee-validate'
import DriverEditor from '../../organisms/DriverEditor'
import TutorialEntity from '../../atoms/Entities/TutorialEntity'
import BaseHeading from '../../atoms/BaseHeading'
import {
  ADD,
  CANCEL,
  EDIT,
  PREVIEW,
  PREVIEW_DONE,
  SAVE,
} from '../../../constants/drvier-editor-command-types'
import AddStepButton from '../../organisms/AddStepButton/AddStepButton'
import BaseModal from '../../molecules/BaseModal/BaseModal'
import iframeStyler from '../../mixins/iframeStyler'
import ScreenOverlayLayout from '../../molecules/layouts/ScreenOverlayLayout'
import TipsMessage from '../../organisms/messages/TipsMessage'
import WarningMessage from '../../organisms/messages/WarningMessage'
import TheSidebar from '../../organisms/TheSidebar/TheSidebar'
import BaseLoading from '../../atoms/BaseLoading/BaseLoading'
import ModalIcon from '../../atoms/icons/ModalIcon/ModalIcon'
import TooltipIcon from '../../atoms/icons/TooltipIcon/TooltipIcon'
import StepEntity from '../../atoms/Entities/StepEntity'
import PreviewButton from '../../atoms/buttons/PreviewButton'
import TrashButton from '../../atoms/buttons/TrashButton'
import TutorialForm from '../../organisms/forms/TutorialForm'
import BaseTooltip from '../../atoms/BaseTooltip'
import NavigateButton from '../../atoms/buttons/NavigateButton'
import ArrowIcon from '../../atoms/icons/ArrowIcon'
import BaseFadeTransitionGroup from '../../atoms/transitions/BaseFadeTransitionGroup'
import UrlPathForm from '../../organisms/forms/UrlPathForm'
import GoButton from '../../atoms/buttons/GoButton'
import { PATH_EQUALS } from '../../atoms/Entities/PathOperators'
import StepForm from '../../organisms/forms/StepForm'
import PenButton from '../../atoms/buttons/PenButton'

export default {
  name: 'TutorialTemplate',
  mixins: [iframeStyler],
  components: {
    PenButton,
    StepForm,
    GoButton,
    UrlPathForm,
    BaseFadeTransitionGroup,
    ArrowIcon,
    NavigateButton,
    BaseTooltip,
    TutorialForm,
    TrashButton,
    PreviewButton,
    TooltipIcon,
    ModalIcon,
    BaseLoading,
    ValidationObserver,
    TheSidebar,
    WarningMessage,
    TipsMessage,
    ScreenOverlayLayout,
    BaseModal,
    AddStepButton,
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
      shouldShowTutorialForm: false,
      shouldShowStepForm: false,
      shouldShowUrlPathForm: false,
      showClickToAddStepMessage: false,
      showNoStepAddedYetMessage: false,
      innerTutorial: new TutorialEntity(),
      innerStep: new StepEntity(),
      driverEditorID: `${process.env.VUE_APP_NAME}-editor`,
      activeStepIndex: null,
      newStepIndex: null,
      urlPath: null,
    }
  },
  watch: {
    tutorial: {
      immediate: true,
      handler(value) {
        if (value) {
          this.innerTutorial = value
        } else {
          this.innerTutorial = new TutorialEntity()
        }
      },
    },
    activeStepIndex: {
      handler(value) {
        console.log(value)
        if (value !== null && value > -1) {
          this.innerStep = this.innerTutorial.steps.find(
            (_, index) => index === this.activeStepIndex
          )
        } else {
          this.innerStep = new StepEntity()
        }
      },
    },
  },
  created() {
    window.addEventListener('message', this.onReceiveMessage)
  },
  mounted() {
    if (!document.querySelector(`#${this.driverEditorID}`)) {
      const divElement = window.parent.document.createElement('div')
      divElement.id = this.driverEditorID
      window.parent.document.body.appendChild(divElement)
      const vm = new Vue({
        render: h => h(DriverEditor),
      })
      vm.$mount(divElement)
    }
  },
  beforeDestroy() {
    window.removeEventListener('message', this.onReceiveMessage)
  },
  methods: {
    onReceiveMessage(event) {
      if (event.origin !== window.parent.location.origin) return
      if (typeof event.data !== 'object' || Array.isArray(event.data)) return
      const { app = null, command = null, data = {} } = event.data
      if (app === process.env.VUE_APP_NAME) {
        this.handleCommand(command, data)
      }
    },
    handleCommand(command, data) {
      if (command === SAVE) {
        const step = new StepEntity({
          ...data,
          pathValue: data.pathValue || window.parent.location.pathname,
          pathOperator: data.pathOperator || PATH_EQUALS,
        })
        if (!this.innerTutorial.id) {
          this.innerTutorial.steps = [step]
          this.innerTutorial.pathValue = window.parent.location.pathname
          this.shouldShowTutorialForm = true
        } else {
          if (step.id) {
            this.$emit('update:step', step)
          } else {
            this.innerTutorial.steps = [
              ...this.innerTutorial.steps.slice(0, this.newStepIndex),
              step,
              ...this.innerTutorial.steps.slice(this.newStepIndex),
            ]
            this.$emit('add:step', this.innerTutorial)
          }
          this.shouldShowSideNav = true
        }
        this.showIframe()
      } else if (command === CANCEL || command === PREVIEW_DONE) {
        this.shouldShowSideNav = true
        this.showIframe()
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
      )
    },
    onClickStepType(stepType) {
      if (stepType === 'tooltip') {
        this.showClickToAddStepMessage = true
      } else {
        this.hideIframe()
      }
      this.shouldShowSideNav = false
      this.sendCommand(ADD, {
        type: stepType,
      })
    },
    onCloseClickToAddStepMessage() {
      this.showClickToAddStepMessage = false
      this.hideIframe()
    },
    async onClickTutorialConfirm() {
      const valid = await this.$refs.tutorialForm.validate()
      if (valid) {
        this.$emit('upsert:tutorial', this.innerTutorial)
        this.shouldShowTutorialForm = false
        this.shouldShowSideNav = true
      }
    },
    onStepClick(step) {
      if (step.couldBeShownOn(window.parent.location.pathname)) {
        this.hideIframe()
        this.shouldShowSideNav = false
        this.sendCommand(EDIT, {
          step,
        })
      } else if (step.pathOperator === PATH_EQUALS) {
        // TODO 遷移しますよっていうmodal出す
        window.parent.location.href =
          window.parent.location.origin + step.pathValue
      } else {
        this.shouldShowUrlPathForm = true
      }
    },
    async onClickStepConfirm() {
      const valid = await this.$refs.stepForm.validate()
      if (valid) {
        this.$emit('upsert:step', this.innerStep)
        this.shouldShowStepForm = false
        this.shouldShowSideNav = true
      }
    },
    onPreviewClick() {
      this.sendCommand(PREVIEW, {
        steps: this.innerTutorial.steps,
      })
      this.hideIframe()
    },
    onStepDeleteClick(step) {
      this.$emit('delete:step', step)
    },
    onStepEditClick() {
      this.shouldShowStepForm = true
    },
    onNavigateClick() {
      this.$emit('click:navigate')
    },
    async onClickGo() {
      const valid = await this.$refs.urlPathForm.validate()
      if (valid) {
        window.parent.location.href =
          window.parent.location.origin + this.urlPath
      }
    },
    onUrlPathFormCancel() {
      this.shouldShowUrlPathForm = false
    },
  },
}
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
.step-definition,
.step-definition__arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.step-definition__arrow {
  position: relative;
}
.step-definition__step {
  position: relative;
  display: inline-block;
  padding: 15px;
  border-radius: 50%;
  width: 75px;
  height: 75px;
}
.step-definition__step + .step-definition__step {
  margin-top: 70px;
}

.step-definition__step > svg {
  width: 45px;
}
.step-definition__prepend,
.step-definition__arrow,
.step-definition__add,
.step-definition__edit,
.step-definition__delete {
  position: absolute;
  border-radius: 50%;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  font-size: 8px;
}

.step-definition__edit {
  top: -30px;
  right: -30px;
}

.step-definition__delete {
  top: 20px;
  right: -50px;
}

.step-definition__prepend {
  top: -55px;
  left: 20px;
}
.step-definition__arrow,
.step-definition__add {
  bottom: -55px;
  left: 20px;
}
.step-definition__add {
  z-index: 2;
}
.step-definition__actions {
  width: 100%;
  padding-left: 0;
  padding-right: 0;
}
</style>
