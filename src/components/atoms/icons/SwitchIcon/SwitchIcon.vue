<template>
  <b-icon
    icon="exchange-alt"
    v-bind="$attrs"
    @click.native="$emit('click')"
  >
  </b-icon>
</template>

<script>
export default {
  name: 'SwitchIcon',
};
</script>

<style scoped>

</style>
