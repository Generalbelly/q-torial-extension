<template>
  <nav class="navbar level has-background-dark has-margin-bottom-0 has-padding-5 is-fixed-bottom">
    <div class="level-left">
      <span class="has-text-white has-cursor-pointer" @click.native="$emit('click:logo')">
        Omotenashi
      </span>
    </div>
    <div class="level-right">
      <p class="level-item">
        <base-button is-primary @click="$emit('click:tutorials-button')">
          Tutorials
        </base-button>
      </p>
    </div>
  </nav>
</template>
<script>
import BaseButton from '../../atoms/BaseButton';

export default {
  name: 'Navbar',
  components: {
    BaseButton,
  },
};
</script>
<style scoped>
.navbar {
  z-index: 10000000;
}
</style>
