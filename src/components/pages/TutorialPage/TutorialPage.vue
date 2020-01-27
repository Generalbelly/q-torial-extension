<template>
  <tutorial-template
    :tutorial="tutorial"
    :loading="requesting"
    :previewing="previewing"
    :navigating="navigating"
    :pending-step-index="pendingStepIndex"
    @click:add="$emit('click:add')"
    @upsert:tutorial="onUpsertTutorial"
    @add:step="onAddStep"
    @update:step="onUpdateStep"
    @delete:step="onDeleteStep"
    @click:navigate="onClickNavigate"
    @update:previewing="onUpdatePreviewing"
    @click:close="$emit('click:close')"
    @update:pending-step="onUpdatePendingStep"
  />
</template>
<script>
import { mapState, mapActions } from 'vuex';
import TutorialTemplate from '../../templates/TutorialTemplate';

export default {
  name: 'TutorialPage',
  components: {
    TutorialTemplate,
  },
  computed: {
    ...mapState([
      'requesting',
      'user',
      'tutorial',
      'navigating',
      'previewing',
      'pendingStepIndex',
    ]),
  },
  methods: {
    ...mapActions([
      'addTutorial',
      'updateTutorial',
      'addStep',
      'updateStep',
      // 'upsertStep',
      'deleteStep',
      'setPendingStepIndex',
      'setPreviewing',
      'setNavigating',
    ]),
    onAddStep(step) {
      this.addStep(step);
    },
    onUpdateStep(step) {
      this.updateStep(step);
    },
    onDeleteStep(step) {
      this.deleteStep(step);
    },
    onUpsertTutorial(tutorial) {
      if (tutorial.id) {
        this.updateTutorial(tutorial);
      } else {
        this.addTutorial(tutorial);
      }
    },
    onUpdatePendingStep(value) {
      this.setPendingStepIndex(value);
    },
    onUpdatePreviewing(value) {
      this.setPreviewing(value);
    },
    onClickNavigate() {
      this.setNavigating(true);
    },
  },
};
</script>
