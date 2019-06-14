<template>
  <base-table
    v-bind="$attrs"
    :columns="columns"
    item-type="tutorial"
    @sort="$emit('sort', $event)"
    @select="$emit('select', $event)"
    @click:create-first-item="$emit('click:create-first-tutorial')"
    @click:show-more="$emit('click:show-more')"
  >
  </base-table>
</template>
<script>
import BaseTable from '../../molecules/BaseTable';

const columns = [
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
    field: 'createdAtAsDate',
    label: 'Created at',
    sortable: true,
  },
];

export default {
  name: 'TutorialTable',
  components: {
    BaseTable,
  },
  data() {
    return {
      columns,
    };
  },
};
</script>

<style scoped></style>
