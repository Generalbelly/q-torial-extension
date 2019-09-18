<template>
  <div>
    <base-modal
      active
      @click:close="$emit('click:close')"
      :hide-footer="shouldShowTutorialTable"
      @click:cancel="shouldShowTutorialForm = false"
      @click:confirm="onClickConfirm"
    >
      <template v-slot:content>
        <base-fade-transition-group>
          <index-page-layout
            key="table"
            v-show="shouldShowTutorialTable"
            title="Tutorials"
          >
            <template v-slot:search>
              <search-field
                :value="query"
                @input="$emit('change:query', $event)"
                search-button-class="is-primary-050"
                @click:search="$emit('click:search')"
              />
            </template>
            <template v-slot:add>
              <add-button @click="$emit('click:add')" class="is-primary" />
            </template>
            <template v-slot:table>
              <tutorial-table
                :data="tutorials"
                :loading="loading"
                :loadable="loadable"
                :order-by="orderBy"
                :total="total"
                @sort="$emit('sort', $event)"
                @select="$emit('select', $event)"
                @click:create-first-tutorial="$emit('click:add', $event)"
                @click:show-more="$emit('click:show-more', $event)"
                @click:edit="onClickEdit"
                @click:delete="$emit('click:delete', $event)"
              />
            </template>
          </index-page-layout>
          <validation-observer key="tutorialForm" ref="tutorialForm">
            <tutorial-form
              v-show="shouldShowTutorialForm"
              :id="innerTutorial.id"
              :name.sync="innerTutorial.name"
              :description.sync="innerTutorial.description"
              :path-value.sync="innerTutorial.pathValue"
              :path-operator.sync="innerTutorial.pathOperator"
              :parameters.sync="innerTutorial.parameters"
              :domain.sync="innerTutorial.domain"
              :settings.sync="innerTutorial.settings"
            />
          </validation-observer>
        </base-fade-transition-group>
      </template>
    </base-modal>
    <template v-if="tutorial">
      <base-modal
        :active="shouldShowUrlPathForm"
        :can-cancel="false"
        @click:cancel="onUrlPathFormCancel"
      >
        <template v-slot:content>
          <validation-observer key="pathForm" ref="pathForm">
            <url-path-form
              :url-path.sync="urlPath"
              :path-operator="tutorial.pathOperator"
              :path-value="tutorial.pathValue"
            />
          </validation-observer>
        </template>
        <template v-slot:primary-action-button>
          <go-button @click="onClickGo" />
        </template>
      </base-modal>
    </template>
  </div>
</template>

<script>
import { ValidationObserver } from 'vee-validate'
import TutorialTable from '../../organisms/TutorialTable'
import IndexPageLayout from '../../molecules/layouts/IndexPageLayout'
import SearchField from '../../molecules/fields/SearchField'
import AddButton from '../../atoms/buttons/AddButton'
import BaseModal from '../../molecules/BaseModal'
import TutorialForm from '../../organisms/forms/TutorialForm'
import BaseFadeTransitionGroup from '../../atoms/transitions/BaseFadeTransitionGroup'
import TutorialEntity from '../../atoms/Entities/TutorialEntity'
import BaseButton from '../../atoms/BaseButton'
import UrlPathForm from '../../organisms/forms/UrlPathForm'
import GoButton from '../../atoms/buttons/GoButton/GoButton'

export default {
  name: 'TutorialsTemplate',
  components: {
    GoButton,
    UrlPathForm,
    BaseButton,
    ValidationObserver,
    BaseFadeTransitionGroup,
    TutorialForm,
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
    tutorial: {
      type: Object,
      default: null,
    },
    tutorials: {
      type: Array,
      default() {
        return []
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
        return []
      },
    },
    tutorialNeedsToBeRedirected: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      shouldShowTutorialForm: false,
      shouldShowUrlPathForm: false,
      innerTutorial: new TutorialEntity(),
      urlPath: null,
    }
  },
  computed: {
    shouldShowTutorialTable() {
      return !this.shouldShowTutorialForm && !this.shouldShowUrlPathForm
    },
  },
  watch: {
    tutorialNeedsToBeRedirected(value) {
      if (value) {
        this.shouldShowUrlPathForm = true
      }
    },
  },
  methods: {
    onClickEdit(tutorial) {
      this.innerTutorial = tutorial
      this.shouldShowTutorialForm = true
    },
    async onClickConfirm() {
      const valid = await this.$refs.tutorialForm.validate()
      if (valid) {
        this.$emit('update:tutorial', this.innerTutorial)
        this.shouldShowTutorialForm = false
      }
    },
    async onClickGo() {
      const valid = await this.$refs.pathForm.validate()
      if (valid) {
        window.parent.location.href =
          window.parent.location.origin + this.urlPath
      }
    },
    onUrlPathFormCancel() {
      this.shouldShowUrlPathForm = false
      this.$emit('select', { id: null })
    },
  },
}
</script>

<style></style>
