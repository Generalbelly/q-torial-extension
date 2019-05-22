<template>
  <nav class="has-background-neutral-050 side-bar" :style="{ width: width }">
    <div :class="isOnRight ? '' : 'side-bar__header--reverse'" class="has-background-neutral-700 has-text-white has-padding-x-4 has-padding-y-3 side-bar__header">
      <close-icon size="is-large" class="side-bar__close-icon has-cursor-pointer" @click="$emit('click:close')" />
      <switch-icon class="side-bar__switch-icon has-cursor-pointer" @click="$emit('click:switch')" />
    </div>
    <div class="has-padding-4">
      <slot />
    </div>
  </nav>
</template>
<script>
import CloseIcon from '../../atoms/icons/CloseIcon';
import SwitchIcon from '../../atoms/icons/SwitchIcon';

export default {
  name: 'TheSidebar',
  components: {
    SwitchIcon,
    CloseIcon,
  },
  props: {
    isOnRight: {
      type: Boolean,
      default: true,
    },
    width: {
      type: String,
      default: '300px',
    },
  },
};
</script>
<style scoped>
.side-bar {
  height: 100vh;
}
.side-bar__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.side-bar__header--reverse {
  flex-direction: row-reverse;
}
.side-bar__close-icon {
  background-color: transparent;
}
.side-bar__switch-icon {
  max-width: 18px;
  max-height: 18px;
}
</style>
