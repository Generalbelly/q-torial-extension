<template>
  <div>
    <div class="label">
      Show this step for a user visiting the following condition(s).
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
    <base-column>
      <checkbox-field v-model="parametersRequired">
        with parameters
      </checkbox-field>
      <parameter-fields v-show="parametersRequired" v-model="innerParameters" />
    </base-column>
  </div>
</template>
<script>
import BaseColumn from '../../../atoms/BaseColumn/BaseColumn'
import BaseColumns from '../../../atoms/BaseColumns/BaseColumns'
import CheckboxField from '../../../molecules/fields/CheckboxField'
import ParameterFields from '../../../molecules/fields/ParameterFields'
import SelectField from '../../../molecules/fields/SelectField'
import TextareaField from '../../../molecules/fields/TextareaField'
import ValidatableTextField from '../../../molecules/fields/ValidatableTextField'
import PathOperators from '../../../atoms/Entities/PathOperators'

export default {
  name: 'StepForm',
  components: {
    BaseColumn,
    BaseColumns,
    CheckboxField,
    ParameterFields,
    SelectField,
    TextareaField,
    ValidatableTextField,
  },
  props: {
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
  },
  data() {
    return {
      parametersRequired: false,
      pathOperators: PathOperators,
    }
  },
  computed: {
    hostname() {
      return window.parent.location.hostname
    },
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
  },
}
</script>
<style scoped></style>
