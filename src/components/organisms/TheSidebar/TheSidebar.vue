<template>
  <nav
    class="has-background-grey-dark side-bar"
    :style="{'width': width}"
  >
    <div
      :class="isOnRight ? '' : 'side-bar__header--reverse'"
      class="side-bar__header has-padding-3"
    >
      <close-icon
        size="is-large"
        class="side-bar__close-icon"
        @click="$emit('click:close')"
      />
      <switch-icon
        class="has-text-white side-bar__switch-icon"
        @click="$emit('click:switch')"
      />
    </div>
    <div class="has-padding-3">
      <slot />
    </div>
  </nav>
</template>
<script>
import CloseIcon from '../../atoms/icons/CloseIcon';
import SwitchIcon from '../../atoms/icons/SwitchIcon';
import BaseLevel from '../../atoms/BaseLevel/BaseLevel';
import BaseLevelLeft from '../../atoms/BaseLevelLeft/BaseLevelLeft';
import BaseLevelRight from '../../atoms/BaseLevelRight';
import BaseLevelItem from '../../atoms/BaseLevelItem/BaseLevelItem';

export default {
  name: 'TheSidebar',
  components: {
    BaseLevelItem,
    BaseLevelRight,
    BaseLevelLeft,
    BaseLevel,
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
