<template>
  <b-icon v-on="$listeners" v-bind="$attrs" @click.native="$emit('click')">
  </b-icon>
</template>

<script>
export default {
  name: 'BaseIcon',
}
</script>
