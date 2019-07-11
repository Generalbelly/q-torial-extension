<template>
  <div>
    <the-sidebar
      v-show="shouldShowSideNav"
      :class="
        shouldShowSideNavRight ? 'is-fixed-top-right' : 'is-fixed-top-left'
      "
      :is-on-right="shouldShowSideNavRight"
      @click:close="$emit('click:close')"
      @click:switch="shouldShowSideNavRight = !shouldShowSideNavRight"
    >
      <div
        v-if="innerTutorial.id"
        @click="shouldShowTutorialForm = true"
        class="has-margin-bottom-5"
      >
        <base-tooltip
          label="Click to edit tutorial settings"
          type="is-neutral-050"
        >
          <base-heading>
            {{ innerTutorial.name }}
          </base-heading>
        </base-tooltip>
      </div>
      <div>
        <p v-if="innerTutorial.steps.length === 0">
          You haven't added any steps yet.
        </p>
        <div v-else class="step-definition">
          <template v-for="(step, stepIndex) in innerTutorial.steps">
            <span
              class="step-definition__step has-background-grey has-cursor-pointer"
              @click="onStepClick(step)"
              @mouseenter="hoveredStepIndex = stepIndex"
              @mouseleave="hoveredStepIndex = null"
            >
              <modal-icon v-if="step.type === 'modal'" />
              <tooltip-icon v-else-if="step.type === 'tooltip'" />
              <base-fade-transition>
                <trash-button
                  key="trash"
                  v-show="hoveredStepIndex === stepIndex"
                  class="step-definition__delete"
                  type="is-neutral"
                  @click.stop="onStepDeleteClick(step)"
                />
                <!--                <pen-button-->
                <!--                  key="pen"-->
                <!--                  v-show="hoveredStepIndex === stepIndex"-->
                <!--                  class="step-definition__edit"-->
                <!--                  type="is-neutral"-->
                <!--                  @click.stop="onStepEditClick(step)"-->
                <!--                />-->
              </base-fade-transition>
            </span>
            <span class="step-definition">
              <base-icon
                v-if="stepIndex < innerTutorial.steps.length - 1"
                icon="arrow-down"
              />
            </span>
          </template>
        </div>
        <div class="has-margin-top-5">
          <add-step-button
            class="is-fullwidth has-margin-bottom-3"
            @click:step-type="onClickStepType"
          />
          <preview-button
            v-if="innerTutorial.steps.length > 0"
            class="is-fullwidth"
            @click="onPreviewClick"
          />
        </div>
      </div>
    </the-sidebar>
    <validation-observer ref="tutorialObserver">
      <base-modal
        :active="shouldShowTutorialForm"
        :can-cancel="false"
        @click:close="shouldShowTutorialForm = false"
        @click:confirm="onClickTutorialConfirm"
        @click:cancel="shouldShowTutorialForm = false"
      >
        <template v-slot:content>
          <tutorial-form
            :name.sync="innerTutorial.name"
            :description.sync="innerTutorial.description"
            :path-value.sync="innerTutorial.pathValue"
            :path-operator.sync="innerTutorial.pathOperator"
            :parameters.sync="innerTutorial.parameters"
            :domain.sync="innerTutorial.domain"
          />
        </template>
      </base-modal>
    </validation-observer>
    <!--    <validation-observer ref="stepObserver">-->
    <!--      <base-modal-->
    <!--        :active="shouldShowStepForm"-->
    <!--        :can-cancel="false"-->
    <!--        @click:close="shouldShowStepForm = false"-->
    <!--        @click:confirm="onClickStepConfirm"-->
    <!--        @click:cancel="shouldShowStepForm = false"-->
    <!--      >-->
    <!--        <template v-slot:content>-->
    <!--          <step-form-->
    <!--            :path-value.sync="innerStep.pathValue"-->
    <!--            :path-operator.sync="innerStep.pathOperator"-->
    <!--            :parameters.sync="innerStep.parameters"-->
    <!--            :domain.sync="innerStep.domain"-->
    <!--          />-->
    <!--        </template>-->
    <!--      </base-modal>-->
    <!--    </validation-observer>-->
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
import BaseIcon from '../../atoms/icons/BaseIcon/BaseIcon'
import StepEntity from '../../atoms/Entities/StepEntity'
import PreviewButton from '../../atoms/buttons/PreviewButton/PreviewButton'
import TrashButton from '../../atoms/buttons/TrashButton/TrashButton'
import TutorialForm from '../../organisms/forms/TutorialForm/TutorialForm'
import BaseTooltip from '../../atoms/BaseTooltip/BaseTooltip'
import PenButton from '../../atoms/buttons/PenButton/PenButton'
import BaseFadeTransitionGroup from '../../atoms/transitions/BaseFadeTransitionGroup/BaseFadeTransitionGroup'
import StepForm from '../../organisms/forms/StepForm/StepForm'
import BaseFadeTransition from '../../atoms/transitions/BaseFadeTransition/BaseFadeTransition'

export default {
  name: 'TutorialTemplate',
  mixins: [iframeStyler],
  components: {
    BaseFadeTransition,
    StepForm,
    BaseFadeTransitionGroup,
    PenButton,
    BaseTooltip,
    TutorialForm,
    TrashButton,
    PreviewButton,
    BaseIcon,
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
      showClickToAddStepMessage: false,
      showNoStepAddedYetMessage: false,
      innerTutorial: new TutorialEntity(),
      innerStep: new StepEntity(),
      driverEditorID: `${process.env.VUE_APP_NAME}-editor`,
      hoveredStepIndex: null,
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
    hoveredStepIndex: {
      handler(value) {
        if (value !== null && value > -1) {
          this.innerStep = this.innerTutorial.steps.find(
            (_, index) => index === this.hoveredStepIndex
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
        if (!this.innerTutorial.id) {
          this.innerTutorial.steps = [new StepEntity(data)]
          this.innerTutorial.pathValue = window.parent.location.pathname
          this.shouldShowTutorialForm = true
        } else {
          this.$emit(
            'upsert:step',
            new StepEntity({
              pathValue: window.parent.location.pathname,
              ...data,
            })
          )
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
      const valid = await this.$refs.tutorialObserver.validate()
      if (valid) {
        this.$emit('add:tutorial', this.innerTutorial)
        this.shouldShowTutorialForm = false
        this.shouldShowSideNav = true
      }
    },
    // async onClickStepConfirm() {
    //   const valid = await this.$refs.stepObserver.validate()
    //   if (valid) {
    //     this.$emit('upsert:step', this.innerStep)
    //     this.shouldShowStepForm = false
    //     this.shouldShowSideNav = true
    //   }
    // },
    onStepClick(step) {
      this.hideIframe()
      this.shouldShowSideNav = false
      this.sendCommand(EDIT, {
        step,
      })
    },
    onPreviewClick() {
      this.sendCommand(PREVIEW, {
        steps: this.innerTutorial.steps,
      })
      this.hideIframe()
    },
    onStepEditClick(step) {
      this.shouldShowStepForm = true
    },
    onStepDeleteClick(step) {
      this.$emit('delete:step', step)
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
.step-definition {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.step-definition__step {
  position: relative;
  display: inline-block;
  padding: 15px;
  border-radius: 50%;
  width: 75px;
  height: 75px;
  margin: 20px 0;
}

.step-definition__step > svg {
  width: 45px;
}
/*.step-definition__delete,*/
/*.step-definition__edit {*/
/*  position: absolute;*/
/*  border-radius: 50%;*/
/*  display: inline-flex;*/
/*  justify-content: center;*/
/*  align-items: center;*/
/*  width: 40px;*/
/*  height: 40px;*/
/*  font-size: 8px;*/
/*}*/
/*.step-definition__edit {*/
/*  top: -30px;*/
/*  right: -30px;*/
/*}*/
/*.step-definition__delete {*/
/*  right: -50px;*/
/*  top: 15px;*/
/*}*/
.step-definition__delete {
  position: absolute;
  border-radius: 50%;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  font-size: 8px;
  top: -30px;
  right: -30px;
}
</style>
