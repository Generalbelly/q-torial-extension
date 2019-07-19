<template>
  <base-icon icon="plus" v-bind="$attrs" @click="$emit('click', $event)" />
</template>

<script>
import BaseIcon from '../BaseIcon'

export default {
  name: 'PlusIcon',
  components: {
    BaseIcon,
  },
}
</script>

<style scoped></style>
