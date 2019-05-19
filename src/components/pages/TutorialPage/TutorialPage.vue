<template>
  <tutorial-template
    @click:add="$emit('click:add')"
  ></tutorial-template>
</template>
<script>
import { debounce } from 'debounce';
import { mapActions, mapGetters, mapState } from 'vuex';
import TutorialTemplate from '../../templates/TutorialTemplate';

export default {
  name: 'TutorialPage',
  components: {
    TutorialTemplate,
  },
  data() {
    return {};
  },
  created() {
    console.log('create');
  }
};
</script>
