<template>
  <base-icon icon="cog" v-bind="$attrs" @click="$emit('click', $event)" />
</template>

<script>
import BaseIcon from '../BaseIcon'

export default {
  name: 'CogIcon',
  components: {
    BaseIcon,
  },
}
</script>

<style scoped></style>
