<template>
  <base-icon icon="trash" v-bind="$attrs" @click="$emit('click', $event)" />
</template>

<script>
import BaseIcon from '../BaseIcon'

export default {
  name: 'TrashIcon',
  components: {
    BaseIcon,
  },
}
</script>

<style scoped></style>
