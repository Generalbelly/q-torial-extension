<template>
  <tutorials-template
    :tutorial="tutorial"
    :query="searchQuery"
    :loading="requesting"
    :loadable="loadable"
    :tutorials="tutorials"
    :order-by="orderBy"
    :tutorial-needs-to-be-redirected="tutorialNeedsToBeRedirected"
    @click:add="onClickAdd"
    @select="onSelect"
    @change:query="onChangeQuery"
    @click:search="onChangeQuery"
    @click:show-more="onClickShowMore"
    @sort="onSort"
    @click:close="$emit('click:close')"
    @click:delete="onClickDelete"
    @update:tutorial="onUpdateTutorial"
  />
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { debounce } from 'debounce'
import TutorialsTemplate from '../../templates/TutorialsTemplate'
import { QUERY_LIMIT } from '../../../constants/general'
import { PATH_EQUALS } from '../../atoms/Entities/PathOperators'

export default {
  name: 'TutorialsPage',
  components: {
    TutorialsTemplate,
  },
  data() {
    return {
      tutorialNeedsToBeRedirected: false,
    }
  },
  computed: {
    loadable() {
      return !this.allFetched && this.tutorials.length >= QUERY_LIMIT
    },
    ...mapState([
      'tutorial',
      'tutorials',
      'searchQuery',
      'requesting',
      'allFetched',
      'orderBy',
      'user',
    ]),
  },
  methods: {
    ...mapActions([
      'listTutorials',
      'deleteTutorial',
      'selectTutorial',
      'sortTutorials',
      'updateTutorial',
    ]),
    async onClickAdd() {
      this.selectTutorial({ id: null })
      this.$emit('click:add')
    },
    async onSelect(tutorial) {
      await this.selectTutorial(tutorial)
      if (tutorial.couldBeShownOn(window.parent.location.pathname)) {
        this.$emit('select:tutorial', tutorial)
      } else if (tutorial.pathOperator === PATH_EQUALS) {
        // TODO 遷移しますよっていうmodal出す
        window.parent.location.href =
          window.parent.location.origin + tutorial.pathValue
      } else {
        this.tutorialNeedsToBeRedirected = true
      }
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
    onClickDelete(tutorial) {
      this.deleteTutorial(tutorial.toPlainObject())
    },
    onChangeQuery: debounce(function(query) {
      this.listTutorials({
        searchQuery: query,
      })
    }, 500),
    onUpdateTutorial(tutorial) {
      const data = tutorial.toPlainObject()
      this.updateTutorial(data)
    },
  },
}
</script>
