<template>
  <b-message
    v-bind="$attrs"
    :active="active"
    @close="$emit('close')"
  >
    <slot />
  </b-message>
</template>

<script>
export default {
  name: 'BaseMessage',
  props: {
    active: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped></style>
