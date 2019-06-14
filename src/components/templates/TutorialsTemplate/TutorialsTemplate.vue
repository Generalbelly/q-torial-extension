<template>
  <base-modal active @click:close="$emit('click:close')" hide-footer>
    <index-page-layout title="Tutorials">
      <template v-slot:search>
        <search-field :value="query" @input="$emit('change:query', $event)" search-button-class="is-primary-050" @click:search="$emit('click:search')"></search-field>
      </template>
      <template v-slot:add>
        <add-button @click="$emit('click:add')" class="is-primary"></add-button>
      </template>
      <template v-slot:table>
        <tutorial-table
          :data="tutorials"
          :columns="columns"
          :loading="loading"
          :loadable="loadable"
          :order-by="orderBy"
          :total="total"
          @sort="$emit('sort', $event)"
          @select="$emit('select', $event)"
          @click:create-first-tutorial="$emit('click:add')"
          @click:show-more="$emit('click:show-more')"
        ></tutorial-table>
      </template>
    </index-page-layout>
  </base-modal>
</template>

<script>
import TutorialTable from '../../organisms/TutorialTable';
import IndexPageLayout from '../../molecules/layouts/IndexPageLayout';
import SearchField from '../../molecules/fields/SearchField';
import AddButton from '../../atoms/buttons/AddButton';
import BaseModal from '../../molecules/BaseModal';

export default {
  name: 'TutorialsTemplate',
  components: {
    BaseModal,
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
    tutorials: {
      type: Array,
      default() {
        return [];
      },
    },
    total: {
      type: Number,
      default: 0,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    loadable: {
      type: Boolean,
      default: false,
    },
    orderBy: {
      type: Array,
      default() {
        return [];
      },
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
        {
          field: 'description',
          label: 'Description',
          sortable: false,
        },
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
          field: 'createdAt',
          label: 'Created at',
          sortable: true,
        },
      ],
    };
  },
};
</script>

<style></style>
