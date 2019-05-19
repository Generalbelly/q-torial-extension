<template>
  <index-page-layout
    title="Tutorials"
  >
    <template v-slot:search>
      <search-field
        :value="query"
        @input="$emit('change:query', $event)"
        search-button-class="is-primary-050"
        @click:search="$emit('click:search')"
      ></search-field>
    </template>
    <template v-slot:add>
      <add-button
        @click="$emit('click:add')"
        class="is-primary"
      ></add-button>
    </template>
    <template v-slot:table>
      <tutorial-table
        :pagination="pagination"
        :data="tutorialEntities"
        :columns="columns"
        :loading="isLoading"
        :total="total"
        @change:pagination="$emit('change:pagination', $event)"
        @select="$emit('select', $event)"
        @click:create-first-tutorial="$emit('click:add')"
      ></tutorial-table>
    </template>
  </index-page-layout>
</template>

<script>
import TutorialTable from '../../organisms/TutorialTable/TutorialTable';
import IndexPageLayout from '../../layouts/IndexPageLayout/IndexPageLayout';
import SearchField from '../../atoms/fields/SearchField/SearchField';
import AddButton from '../../atoms/buttons/AddButton/AddButton';

export default {
  name: 'TutorialsTemplate',
  components: {
    AddButton,
    SearchField,
    IndexPageLayout,
    TutorialTable,
  },
  props: {
    query: {
      type: String,
      default: null,
    },
    pagination: {
      type: Object,
      default() {
        return {};
      }
    },
    tutorialEntities: {
      type: Array,
      default() {
        return [];
      },
    },
    total: {
      type: Number,
      default: 0,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      columns: [
        {
          field: 'name',
          label: 'Name',
          sortable: true,
        },
        // {
        //     field: 'description',
        //     label: 'Description',
        //     sortable: true,
        // },
        {
          field: 'path_in_text',
          label: 'Path',
          sortable: false,
        },
        {
          field: 'query',
          label: 'Parameters',
          sortable: false,
        },
        {
          field: 'created_at',
          label: 'Created at',
          sortable: true,
        },
      ],
    };
  },
};
</script>

<style></style>
