<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    class="icon-collection"
  >
    <rect width="20" height="12" x="2" y="10" class="primary" rx="2" />
    <path
      class="secondary"
      d="M20 8H4c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2zm-2-4H6c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2z"
    />
  </svg>
</template>

<script>
export default {
  name: 'ModalIcon',
}
</script>

<style scoped lang="scss">
@import '../../../../../sass/variables';
.icon-collection {
  transform: scale(-1);
}
.primary {
  fill: $primary-050;
}
.secondary {
  fill: $neutral-200;
}
</style>
