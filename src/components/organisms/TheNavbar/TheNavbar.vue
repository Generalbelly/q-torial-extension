<template>
  <nav class="navbar level has-background-neutral-700 has-margin-bottom-0 has-padding-5 is-fixed-bottom">
    <div class="level-left">
      <span class="has-text-white has-cursor-pointer" @click="$emit('click:logo')">
        Qtorial
      </span>
    </div>
    <div class="level-right">
      <p class="level-item">
        <base-button class="is-primary" @click="$emit('click:tutorials-button')">
          Tutorials
        </base-button>
      </p>
    </div>
  </nav>
</template>
<script>
import BaseButton from '../../atoms/BaseButton';

export default {
  name: 'TheNavbar',
  components: {
    BaseButton,
  },
};
</script>
<style scoped>
.navbar {
  width: 100vw;
}
</style>
