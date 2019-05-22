<template>
  <b-dropdown aria-role="list">
    <template v-slot:trigger>
      <slot />
    </template>
    <template v-for="item in items">
      <b-dropdown-item aria-role="listitem" @click="$emit('click:item', item.value)">
        {{ item.text }}
      </b-dropdown-item>
    </template>
  </b-dropdown>
</template>
<script>
export default {
  name: 'BaseDropdown',
  props: {
    items: {
      type: Array,
      default() {
        return [];
      },
    },
    itemText: {
      type: String,
      default: 'text',
    },
    itemValue: {
      type: String,
      default: 'value',
    },
  },
};
</script>
