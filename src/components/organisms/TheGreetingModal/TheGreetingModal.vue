<template>
  <base-modal @closeClick="$emit('closeClick')" :show-close="false">
    <h1 class="has-padding-bottom-4 has-text-weight-bold">Welcome to Qtorial</h1>
    <p class="has-padding-bottom-4 has-text-left">
      Tutorials for user onboarding can be hard to build and maintain.<br />
      Our goal is to make it easy and fun by enabling you to create code-free.<br /><br />
    </p>
    <div>
      <BaseButton is-primary @click="$emit('click:start')">
        Let's get started!
      </BaseButton>
    </div>
  </base-modal>
</template>
<script>
import BaseModal from '../../molecules/BaseModal';
import BaseButton from '../../atoms/BaseButton';

export default {
  name: 'TheGreetingModal',
  components: {
    BaseModal,
    BaseButton,
  },
};
</script>
