<template>
  <tutorial-template
    :tutorial="tutorial"
    :loading="requesting"
    @click:add="$emit('click:add')"
    @update:tutorial="onUpdateTutorial"
    @click:close="$emit('click:close')"
  ></tutorial-template>
</template>
<script>
import { mapGetters, mapState, mapActions } from 'vuex';
import TutorialTemplate from '../../templates/TutorialTemplate';

export default {
  name: 'TutorialPage',
  components: {
    TutorialTemplate,
  },
  computed: {
    ...mapGetters(['tutorial']),
    ...mapState(['requesting', 'user']),
  },
  methods: {
    ...mapActions(['upsertTutorial', 'upsertStep']),
    onUpdateTutorial(tutorial) {
      const data = tutorial.toPlainObject();
      this.upsertTutorial(data);
    },
  },
};
</script>
