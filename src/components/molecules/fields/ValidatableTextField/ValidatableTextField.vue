<template>
  <validation-provider :name="name" :rules="rules" ref="provider">
    <text-field
      v-bind="$attrs"
      slot-scope="{ errors, valid }"
      :message="errors"
      v-model="inputValue"
      :type="getType(errors, valid)"
    />
  </validation-provider>
</template>

<script>
import { ValidationProvider } from 'vee-validate'
import validatable from '../../../mixins/validatable'
import TextField from '../TextField'

export default {
  name: 'ValidatableTextField',
  mixins: [validatable],
  props: {
    value: {
      type: String,
      default: null,
    },
  },
  components: {
    TextField,
    ValidationProvider,
  },
  computed: {
    inputValue: {
      get() {
        return this.value
      },
      set(newValue) {
        return this.$emit('input', newValue)
      },
    },
  },
}
</script>

<style scoped></style>
