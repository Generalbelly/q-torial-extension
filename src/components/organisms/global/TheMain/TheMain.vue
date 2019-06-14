<template>
  <div class="modal" :class="active ? 'is-active' : ''">
    <div class="modal-background"></div>
    <div class="modal-content container">
      <div class="has-background-neutral-050 has-padding-5 has-max">
        <slot />
      </div>
    </div>
    <button class="modal-close is-large" aria-label="close" @click="$emit('click:close', $event)"></button>
  </div>
</template>

<script>
export default {
  name: 'TheMain',
  props: {
    active: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped></style>
