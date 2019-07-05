<template>
  <base-modal
    active
    @click:close="$emit('click:close')"
    :hide-footer="!shouldShowTutorialForm"
    @click:cancel="shouldShowTutorialForm = false"
    @click:confirm="onClickConfirm"
  >
    <base-fade-transition-group>
      <index-page-layout
        key="table"
        v-show="!shouldShowTutorialForm"
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
          ></tutorial-table>
        </template>
      </index-page-layout>
      <validation-observer key="form" ref="observer">
        <tutorial-form
          v-show="shouldShowTutorialForm"
          :name.sync="innerTutorial.name"
          :description.sync="innerTutorial.description"
          :path-value.sync="innerTutorial.pathValue"
          :path-operator.sync="innerTutorial.pathOperator"
          :parameters.sync="innerTutorial.parameters"
          :domain.sync="innerTutorial.domain"
        />
      </validation-observer>
    </base-fade-transition-group>
  </base-modal>
</template>

<script>
import { ValidationObserver } from 'vee-validate'
import TutorialTable from '../../organisms/TutorialTable'
import IndexPageLayout from '../../molecules/layouts/IndexPageLayout'
import SearchField from '../../molecules/fields/SearchField'
import AddButton from '../../atoms/buttons/AddButton'
import BaseModal from '../../molecules/BaseModal'
import TutorialForm from '../../organisms/forms/TutorialForm/TutorialForm'
import BaseFadeTransitionGroup from '../../atoms/transitions/BaseFadeTransitionGroup/BaseFadeTransitionGroup'
import TutorialEntity from '../../atoms/Entities/TutorialEntity'

export default {
  name: 'TutorialsTemplate',
  components: {
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
  },
  data() {
    return {
      shouldShowTutorialForm: false,
      innerTutorial: new TutorialEntity(),
    }
  },
  methods: {
    onClickEdit(tutorial) {
      this.innerTutorial = tutorial
      this.shouldShowTutorialForm = true
    },
    async onClickConfirm() {
      const valid = await this.$refs.observer.validate()
      if (valid) {
        this.$emit('update:tutorial', this.innerTutorial)
        this.shouldShowTutorialForm = false
      }
    },
  },
}
</script>

<style></style>
