<template>
  <div class="form">
    <div>
      <div class="label">
        Show this step for a user visiting a page matching the following
        conditions.
      </div>
      <base-columns>
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
      <checkbox-field v-model="parametersRequired">
        with parameters
      </checkbox-field>
      <parameter-fields v-show="parametersRequired" v-model="innerParameters" />
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
      />
    </div>
  </div>
</template>
<script>
import BaseColumn from '../../../atoms/BaseColumn/BaseColumn'
import BaseColumns from '../../../atoms/BaseColumns/BaseColumns'
import CheckboxField from '../../../molecules/fields/CheckboxField'
import ParameterFields from '../../../molecules/fields/ParameterFields'
import SelectField from '../../../molecules/fields/SelectField'
import ValidatableTextField from '../../../molecules/fields/ValidatableTextField'
import PathOperators from '../../../atoms/Entities/PathOperators'
import Validatable from '../../../mixins/validatable'
import ValidatableSelectField from '../../../molecules/fields/ValidatableSelectField/ValidatableSelectField'

const triggers = [
  {
    text: 'After a page has been loaded',
    value: '{"target":"window","event":"load","waitingTime":0}',
  },
  {
    text: 'After a certain HTML element has been clicked',
    value: '{"target":null,"event":"click","waitingTime":0}',
  },
]

export default {
  name: 'StepForm',
  components: {
    ValidatableSelectField,
    Validatable,
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
    pathOperator: {
      type: String,
      default: null,
    },
    pathValue: {
      type: String,
      default: null,
    },
    parameters: {
      type: Array,
      default() {
        return []
      },
    },
    trigger: {
      type: Object,
      default() {
        return {
          target: null,
          event: null,
        }
      },
    },
  },
  data() {
    return {
      parametersRequired: false,
      pathOperators: PathOperators,
      triggers,
      selectorForClickTrigger: null,
    }
  },
  computed: {
    innerPathOperator: {
      get() {
        return this.pathOperator
      },
      set(newValue) {
        this.$emit('update:path-operator', newValue)
      },
    },
    innerPathValue: {
      get() {
        return this.pathValue
      },
      set(newValue) {
        this.$emit('update:path-value', newValue)
      },
    },
    innerParameters: {
      get() {
        return this.parameters
      },
      set(newValue) {
        this.$emit('update:parameters', newValue)
      },
    },
    innerTrigger: {
      get() {
        return JSON.stringify(this.trigger)
      },
      set(newValue) {
        this.$emit('update:trigger', JSON.parse(newValue))
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
          ]
        }
      },
    },
    selectorForClickTrigger(value) {
      this.innerTrigger = {
        ...this.trigger,
        target: value,
      }
    },
  },
}
</script>
<style scoped>
.form > div + div {
  margin-top: 40px;
}
</style>
