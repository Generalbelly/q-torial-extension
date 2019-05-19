<template>
  <button
    class="button"
    @click="$emit('click')"
  >
    <b-icon
      pack="fas"
      icon="plug"
    />
    <span>Connect your Google Analytics account</span>
  </button>
</template>

<script>
export default {
  name: 'ConnectGoogleAnalyticsButton',
};
</script>

<style scoped>

</style>
