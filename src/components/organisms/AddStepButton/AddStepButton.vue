<template>
  <base-dropdown
    :items="stepTypes"
    @click:item="$emit('click:step-type', $event)"
  >
    <div class="plus-icon-container has-background-primary-100">
      <plus-icon />
    </div>
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
import PlusIcon from '../../atoms/icons/PlusIcon/PlusIcon'

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
    PlusIcon,
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
.plus-icon-container {
  border-radius: 50%;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  font-size: 8px;
}
</style>
