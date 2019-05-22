<template>
  <tutorial-template
    @click:add="$emit('click:add')"
    @click:step-type="$emit('click:step-type', $event)"
    @select:step-element="$emit('select:step-element', $event)"
  ></tutorial-template>
</template>
<script>
import TutorialTemplate from '../../templates/TutorialTemplate';

export default {
  name: 'TutorialPage',
  components: {
    TutorialTemplate,
  },
  data() {
    return {};
  },
};
</script>
