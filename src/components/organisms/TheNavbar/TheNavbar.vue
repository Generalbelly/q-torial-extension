<template>
  <nav
    class="navbar level has-background-neutral-700 has-margin-bottom-0 has-padding-4 is-fixed-bottom"
  >
    <div class="level-left">
      <div class="level-item">
        <base-logo
          class="has-cursor-pointer"
          @click.native="$emit('click:logo')"
          :height="50"
          :width="100"
        />
      </div>
    </div>
    <div class="level-right">
      <p class="level-item">
        <base-button class="is-primary" @click="$emit('click:tutorials')">
          Tutorials
        </base-button>
      </p>
    </div>
  </nav>
</template>

<script>
import BaseButton from '../../atoms/BaseButton'
import BaseLogo from '../../atoms/BaseLogo'

export default {
  name: 'TheNavbar',
  components: {
    BaseLogo,
    BaseButton,
  },
}
</script>

<style scoped>
.navbar {
  width: 100vw;
}
</style>
