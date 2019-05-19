<template>
  <b-modal
    :active="active"
    @close="$emit('click:close')"
  >
    <div class="has-background-neutral-050 has-padding-5">
      <slot></slot>
    </div>
  </b-modal>
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

