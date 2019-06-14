<template>
  <base-icon
    icon="trash"
    v-bind="$attrs"
    @click.native="$emit('click')"
  ></base-icon>
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
