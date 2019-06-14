<template>
  <base-dropdown
    :items="stepTypes"
    @click:item="$emit('click:step-type', $event)"
  >
    <add-button />
    <template v-slot:tooltip>
      <span>
        <tooltip-icon class="icon has-margin-right-3" />
        Tooltip
      </span>
    </template>
    <template v-slot:modal>
      <span>
        <modal-icon class="icon has-margin-right-3" />
        Modal
      </span>
    </template>
  </base-dropdown>
</template>
<script>
import BaseDropdown from '../../molecules/BaseDropdown'
import AddButton from '../../atoms/buttons/AddButton'
import TooltipIcon from '../../atoms/icons/TooltipIcon'
import ModalIcon from '../../atoms/icons/ModalIcon'

const stepTypes = [
  {
    text: 'Tooltip',
    value: 'tooltip',
  },
  {
    text: 'Modal',
    value: 'modal',
  },
]

export default {
  name: 'AddStepButton',
  components: {
    ModalIcon,
    TooltipIcon,
    AddButton,
    BaseDropdown,
  },
  data() {
    return {
      stepTypes,
    }
  },
}
</script>

<style scoped>
>>> a > span {
  display: inline-flex;
  align-items: center;
}
.icon {
  max-width: 32px;
}
</style>
