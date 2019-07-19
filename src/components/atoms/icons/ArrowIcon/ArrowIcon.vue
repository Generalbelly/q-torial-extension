<template>
  <base-icon
    icon="arrow-down"
    v-bind="$attrs"
    @click="$emit('click', $event)"
  />
</template>

<script>
import BaseIcon from '../BaseIcon'

export default {
  name: 'ArrowIcon',
  components: {
    BaseIcon,
  },
}
</script>

<style scoped></style>
