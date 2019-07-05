<template>
  <tutorial-template
    :tutorial="tutorial"
    :loading="requesting"
    @click:add="$emit('click:add')"
    @add:tutorial="onAddTutorial"
    @update:tutorial="onUpdateTutorial"
    @upsert:step="onUpsertStep"
    @click:close="$emit('click:close')"
  />
</template>
<script>
import { mapState, mapActions } from 'vuex'
import TutorialTemplate from '../../templates/TutorialTemplate'

export default {
  name: 'TutorialPage',
  components: {
    TutorialTemplate,
  },
  computed: {
    ...mapState(['requesting', 'user', 'tutorial']),
  },
  methods: {
    ...mapActions([
      'addTutorial',
      'updeleteTutorialdateTutorial',
      'upsertStep',
    ]),
    onUpsertStep(step) {
      const data = step.toPlainObject()
      this.upsertStep(data)
    },
    onAddTutorial(tutorial) {
      const data = tutorial.toPlainObject()
      this.addTutorial(data)
    },
    onUpdateTutorial(tutorial) {
      const data = tutorial.toPlainObject()
      this.updateTutorial(data)
    },
  },
}
</script>
