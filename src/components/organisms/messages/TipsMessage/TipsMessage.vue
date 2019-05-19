<template>
  <base-message
    v-bind="$attrs"
    v-on="$listeners"
    type="info"
    title="Tips"
  >
    <slot></slot>
  </base-message>
</template>

<script>
import BaseMessage from '../../../atoms/BaseMessage';
export default {
  name: 'TipsMessage',
  components: {
    BaseMessage,
  },
}
</script>

<style scoped>

</style>
