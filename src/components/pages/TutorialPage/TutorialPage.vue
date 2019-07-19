<template>
  <tutorial-template
    :tutorial="tutorial"
    :loading="requesting"
    @click:add="$emit('click:add')"
    @upsert:tutorial="onUpsertTutorial"
    @add:step="onAddStep"
    @update:step="onUpdateStep"
    @delete:step="onDeleteStep"
    @click:navigate="$emit('click:navigate')"
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
      'updateTutorial',
      'addStep',
      'updateStep',
      'upsertStep',
      'deleteStep',
    ]),
    onAddStep(step) {
      const data = step.toPlainObject()
      this.addStep(data)
    },
    onUpdateStep(step) {
      const data = step.toPlainObject()
      this.updateStep(data)
    },
    onDeleteStep(step) {
      const data = step.toPlainObject()
      this.deleteStep(data)
    },
    onUpsertTutorial(tutorial) {
      const data = tutorial.toPlainObject()
      if (data.id) {
        this.updateTutorial(data)
      } else {
        this.addTutorial(data)
      }
    },
  },
}
</script>
