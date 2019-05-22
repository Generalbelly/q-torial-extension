<template>
  <base-dropdown :items="stepTypes" @click:item="$emit('click:step-type', $event)">
    <add-button />
  </base-dropdown>
</template>
<script>
import BaseDropdown from '../../molecules/BaseDropdown/BaseDropdown';
import AddButton from '../../atoms/buttons/AddButton/AddButton';

const stepTypes = [
  {
    text: 'Tooltip',
    value: 'tooltip',
  },
  {
    text: 'Modal',
    value: 'modal',
  },
];

export default {
  name: 'StepTypeDropdown',
  components: {
    AddButton,
    BaseDropdown,
  },
  data() {
    return {
      stepTypes,
    };
  },
};
</script>

<style scoped></style>
