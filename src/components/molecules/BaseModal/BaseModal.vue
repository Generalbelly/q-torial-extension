<template>
  <b-modal v-bind="$attrs" v-on="$listeners">
    <div class="has-background-white-ter has-padding-4">
      <div class="content">
        <slot></slot>
      </div>
      <grouped-buttons-layout is-right>
        <slot name="secondary-action-button">
          <cancel-button class="is-neutral-100" @click="$emit('click:cancel')"> </cancel-button>
        </slot>
        <slot name="primary-action-button">
          <confirm-button class="is-primary" @click="$emit('click:confirm')"></confirm-button>
        </slot>
      </grouped-buttons-layout>
    </div>
  </b-modal>
</template>

<script>
import GroupedButtonsLayout from '../../layouts/GroupedButtonsLayout';
import CancelButton from '../../atoms/buttons/CancelButton';
import ConfirmButton from '../../atoms/buttons/ConfirmButton';

export default {
  name: 'BaseModal',
  components: { ConfirmButton, CancelButton, GroupedButtonsLayout },
  props: {},
  methods: {},
};
</script>

<style></style>
