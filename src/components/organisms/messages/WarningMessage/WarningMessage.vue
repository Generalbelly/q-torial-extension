<template>
  <base-message
    v-bind="$attrs"
    v-on="$listeners"
    type="warning"
    title="Oops"
  >
    <slot></slot>
  </base-message>
</template>

<script>
import BaseMessage from '../../../atoms/BaseMessage';
export default {
  name: 'WarningMessage',
  components: {
    BaseMessage,
  },
}
</script>

<style scoped>

</style>
