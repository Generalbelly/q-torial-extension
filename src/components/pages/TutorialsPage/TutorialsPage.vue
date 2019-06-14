<template>
  <tutorials-template
    :query="searchQuery"
    :loading="requesting"
    :loadable="loadable"
    :tutorials="tutorials"
    :order-by="orderBy"
    @click:add="onClickAdd"
    @select="onSelect"
    @change:query="onChangeQuery"
    @click:search="onChangeQuery"
    @click:show-more="onClickShowMore"
    @sort="onSort"
    @click:close="$emit('click:close')"
  ></tutorials-template>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { debounce } from 'debounce'
import TutorialsTemplate from '../../templates/TutorialsTemplate'
import { QUERY_LIMIT } from '../../../constants/general'

export default {
  name: 'TutorialsPage',
  components: {
    TutorialsTemplate,
  },
  computed: {
    loadable() {
      return !this.allFetched && this.tutorials.length >= QUERY_LIMIT
    },
    ...mapState([
      'tutorials',
      'searchQuery',
      'requesting',
      'allFetched',
      'orderBy',
      'user',
    ]),
  },
  created() {
    this.listTutorials()
  },
  methods: {
    ...mapActions(['listTutorials', 'selectTutorial', 'sortTutorials']),
    async onClickAdd() {
      this.selectTutorial({ id: null })
      this.$emit('click:add')
    },
    async onSelect(tutorial) {
      this.selectTutorial(tutorial)
      this.$emit('select', tutorial)
    },
    async onSort(orderBy) {
      if (this.loadable) {
        this.listTutorials({
          orderBy,
        })
      } else {
        this.sortTutorials(orderBy)
      }
    },
    onClickShowMore() {
      this.listTutorials()
    },
    onChangeQuery: debounce(function(query) {
      this.listTutorials({
        searchQuery: query,
      })
    }, 500),
  },
}
</script>
