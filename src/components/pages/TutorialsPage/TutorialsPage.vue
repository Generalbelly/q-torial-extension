<template>
  <tutorials-template
    @click:add="$emit('click:add')"
  ></tutorials-template>
</template>
<script>
import { debounce } from 'debounce';
import { mapActions, mapGetters, mapState } from 'vuex';
import TutorialsTemplate from '../../templates/TutorialsTemplate';

export default {
  name: 'TutorialsPage',
  components: {
    TutorialsTemplate,
  },
  data() {
    return {
      query: null,
      pagination: {
        page: 0,
        perPage: 20,
        orderBy: ['created_at', 'desc'],
        total: 0,
      },
    };
  },
};
</script>
