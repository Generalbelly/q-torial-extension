<template>
  <div class="form">
    <div>
      <div class="label">
        Show this step for a user visiting a page matching the following
        conditions.
      </div>
      <base-columns class="is-gapless">
        <base-column>
          <select-field :items="pathOperators" v-model="innerPathOperator" />
        </base-column>
        <base-column>
          <validatable-text-field
            v-model="innerPathValue"
            name="path value"
            rules="required"
          />
        </base-column>
      </base-columns>
    </div>
    <div>
      <validatable-select-field
        label="Timing"
        name="trigger"
        rules="required"
        :items="triggers"
        v-model="innerTrigger"
      />
      <validatable-text-field
        v-if="trigger.event === 'click'"
        name="CSS Selector"
        rules="required"
        label="CSS Selector for the HTML element"
        placeholder="body > div > span.info"
        v-model="selectorForClickTrigger"
        @click.native="$emit('click:selector-field')"
      />
    </div>
    <div>
      <validatable-text-field
        v-if="hasOtherSteps && !lastStep"
        name="Next button text"
        rules="required"
        label="Next button text"
        placeholder="Next"
        v-model="nextBtnText"
      />
      <validatable-text-field
        v-if="hasOtherSteps && !firstStep"
        name="Previous button text"
        rules="required"
        label="Previous button text"
        placeholder="Previous"
        v-model="prevBtnText"
      />
      <validatable-text-field
        name="Close button text"
        rules="required"
        label="Close button text"
        placeholder="Close"
        v-model="closeBtnText"
      />
      <validatable-text-field
        v-if="lastStep"
        name="Done button text"
        rules="required"
        label="Done button text"
        placeholder="Done"
        v-model="doneBtnText"
      />
    </div>
  </div>
</template>
<script>
import BaseColumn from '../../../atoms/BaseColumn';
import BaseColumns from '../../../atoms/BaseColumns';
import CheckboxField from '../../../molecules/fields/CheckboxField';
import ParameterFields from '../../../molecules/fields/ParameterFields';
import SelectField from '../../../molecules/fields/SelectField';
import ValidatableTextField from '../../../molecules/fields/ValidatableTextField';
import PathOperators from '../../../atoms/Entities/PathOperators';
import ValidatableSelectField from '../../../molecules/fields/ValidatableSelectField';
import BaseLevelItem from '../../../atoms/BaseLevelItem/BaseLevelItem';
import BaseLevel from '../../../atoms/BaseLevel/BaseLevel';
import BaseButton from '../../../atoms/BaseButton/BaseButton';

const TRIGGER_TYPE_1 = {
  event: 'load',
  target: 'window',
  waitingTime: 0,
};

const TRIGGER_TYPE_2 = {
  event: 'click',
  target: null,
  waitingTime: 0,
};

const TRIGGER_TYPE_3 = {
  event: null,
  target: null,
  waitingTime: 0,
};

const triggerMap = {
  triggerType1: TRIGGER_TYPE_1,
  triggerType2: TRIGGER_TYPE_2,
  triggerType3: TRIGGER_TYPE_3,
};

const firstStepTriggers = [
  {
    text: 'After a page has been loaded',
    value: 'triggerType1',
  },
  {
    text: 'After a certain HTML element has been clicked',
    value: 'triggerType2',
  },
];
const otherStepTriggers = [
  {
    text: 'When users click "Next" on the previous step',
    value: 'triggerType3',
  },
  {
    text: 'After a certain HTML element has been clicked',
    value: 'triggerType2',
  },
];

export default {
  name: 'StepForm',
  components: {
    BaseButton,
    BaseLevel,
    BaseLevelItem,
    ValidatableSelectField,
    BaseColumn,
    BaseColumns,
    CheckboxField,
    ParameterFields,
    SelectField,
    ValidatableTextField,
  },
  props: {
    firstStep: {
      type: Boolean,
      default: false,
    },
    lastStep: {
      type: Boolean,
      default: false,
    },
    hasOtherSteps: {
      type: Boolean,
      default: false,
    },
    pathOperator: {
      type: String,
      default: null,
    },
    pathValue: {
      type: String,
      default: null,
    },
    // parameters: {
    //   type: Array,
    //   default() {
    //     return []
    //   },
    // },
    trigger: {
      type: Object,
      default() {
        return {
          target: null,
          event: null,
        };
      },
    },
    config: {
      type: Object,
      default() {
        return {
          content: null,
          nextBtnText: 'Next',
          prevBtnText: 'Previous',
          showButtons: true,
          doneBtnText: 'Done',
          closeBtnText: 'Close',
        };
      },
    },
  },
  data() {
    return {
      parametersRequired: false,
      pathOperators: PathOperators,
    };
  },
  computed: {
    triggers() {
      if (this.firstStep) {
        return firstStepTriggers;
      }
      return otherStepTriggers;
    },
    innerPathOperator: {
      get() {
        return this.pathOperator;
      },
      set(newValue) {
        this.$emit('update:path-operator', newValue);
      },
    },
    innerPathValue: {
      get() {
        return this.pathValue;
      },
      set(newValue) {
        this.$emit('update:path-value', newValue);
      },
    },
    // innerParameters: {
    //   get() {
    //     return this.parameters
    //   },
    //   set(newValue) {
    //     this.$emit('update:parameters', newValue)
    //   },
    // },
    innerConfig: {
      get() {
        return this.config;
      },
      set(newValue) {
        this.$emit('update:config', newValue);
      },
    },
    nextBtnText: {
      get() {
        return this.innerConfig.nextBtnText;
      },
      set(newValue) {
        this.innerConfig = {
          ...this.innerConfig,
          nextBtnText: newValue,
        };
      },
    },
    prevBtnText: {
      get() {
        return this.innerConfig.prevBtnText;
      },
      set(newValue) {
        this.innerConfig = {
          ...this.innerConfig,
          prevBtnText: newValue,
        };
      },
    },
    doneBtnText: {
      get() {
        return this.innerConfig.doneBtnText;
      },
      set(newValue) {
        this.innerConfig = {
          ...this.innerConfig,
          doneBtnText: newValue,
        };
      },
    },
    closeBtnText: {
      get() {
        return this.innerConfig.closeBtnText;
      },
      set(newValue) {
        this.innerConfig = {
          ...this.innerConfig,
          closeBtnText: newValue,
        };
      },
    },
    innerTrigger: {
      get() {
        if (this.trigger.event === 'load' && this.trigger.target === 'window') {
          return 'triggerType1';
        }
        return 'triggerType2';
      },
      set(newValue) {
        if (triggerMap[newValue]) {
          this.$emit('update:trigger', triggerMap[newValue]);
        } else {
          this.$emit('update:trigger', newValue);
        }
      },
    },
    selectorForClickTrigger: {
      get() {
        if (this.trigger.target === 'window') {
          return null;
        }
        return this.trigger.target;
      },
      set(newValue) {
        this.innerTrigger = {
          ...this.trigger,
          target: newValue,
        };
      },
    },
  },
  watch: {
    parametersRequired: {
      handler(value) {
        if (value && this.innerParameters.length === 0) {
          this.innerParameters = [
            {
              key: '',
              value: '',
            },
          ];
        }
      },
    },
  },
};
</script>
<style scoped>
.form > div + div {
  margin-top: 40px;
}
</style>
