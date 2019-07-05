<template>
  <base-icon icon="exchange-alt" v-bind="$attrs" @click="$emit('click')" />
</template>

<script>
import BaseIcon from '../BaseIcon'

export default {
  name: 'SwitchIcon',
  components: {
    BaseIcon,
  },
}
</script>

<style scoped></style>
