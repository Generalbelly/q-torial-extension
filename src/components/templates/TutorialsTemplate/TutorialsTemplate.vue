<!--<template>-->
<!--    <div>-->
<!--        <heading>-->
<!--            {{ innerTutorialEntity.id ?  innerTutorialEntity.name : 'New Tutorial' }}-->
<!--        </heading>-->
<!--        &lt;!&ndash;<tutorial-list&ndash;&gt;-->
<!--            &lt;!&ndash;v-show="isHome"&ndash;&gt;-->
<!--            &lt;!&ndash;class="menu"&ndash;&gt;-->
<!--            &lt;!&ndash;:class="{&ndash;&gt;-->
<!--                &lt;!&ndash;'is-fixed-bottom-right': menuIsOnTheRight,&ndash;&gt;-->
<!--                &lt;!&ndash;'is-fixed-bottom-left': !menuIsOnTheRight,&ndash;&gt;-->
<!--            &lt;!&ndash;}"&ndash;&gt;-->
<!--            &lt;!&ndash;:is-loading="requestState === 'REQUEST_LIST_TUTORIALS'"&ndash;&gt;-->
<!--            &lt;!&ndash;:tutorial-entities="tutorialEntities"&ndash;&gt;-->
<!--            &lt;!&ndash;:selected-tutorial="selectedTutorial"&ndash;&gt;-->
<!--            &lt;!&ndash;:selected-step="selectedStep"&ndash;&gt;-->
<!--            &lt;!&ndash;@tutorialChange="e => $emit('tutorialChange', e)"&ndash;&gt;-->
<!--            &lt;!&ndash;@closeClick="$emit('closeClick')"&ndash;&gt;-->
<!--            &lt;!&ndash;@previewClick="onPreviewClick"&ndash;&gt;-->
<!--            &lt;!&ndash;@addStepClick="onAddStepClick"&ndash;&gt;-->
<!--            &lt;!&ndash;@stepClick="onStepClick"&ndash;&gt;-->
<!--            &lt;!&ndash;@deleteStepClick="onDeleteStepClick"&ndash;&gt;-->
<!--            &lt;!&ndash;@addTutorialClick="onAddTutorialClick"&ndash;&gt;-->
<!--            &lt;!&ndash;@editTutorialClick="onEditTutorialClick"&ndash;&gt;-->
<!--            &lt;!&ndash;@deleteTutorialClick="onDeleteTutorialClick"&ndash;&gt;-->
<!--            &lt;!&ndash;@switchSideClick="menuIsOnTheRight = !menuIsOnTheRight"&ndash;&gt;-->
<!--        &lt;!&ndash;&gt;</tutorial-list>&ndash;&gt;-->
<!--        <b-modal active>-->
<!--            <tutorial-table v-show="isHome"-->
<!--                class="has-background-white"-->
<!--                :query="query"-->
<!--                :pagination="pagination"-->
<!--                :tutorial-entities="tutorialEntities"-->
<!--                :is-loading="isRequesting"-->
<!--                @select="$emit('select', $event)"-->
<!--                @click:search="$emit('click:search', $event)"-->
<!--                @change:query="$emit('change:query', $event)"-->
<!--                @change:pagination="$emit('change:pagination', $event)"-->
<!--                @click:add-button="onAddTutorialClick"-->
<!--            ></tutorial-table>-->
<!--            <div v-show="isEditingTutorial || isAddingTutorial">-->
<!--                <validation-observer ref="observer">-->
<!--                    <tutorial-form-->
<!--                        slot-scope="{invalid}"-->
<!--                        :id="innerTutorialEntity.id"-->
<!--                        :name="innerTutorialEntity.name"-->
<!--                        :path="innerTutorialEntity.path"-->
<!--                        :description="innerTutorialEntity.description"-->
<!--                        :parameters="innerTutorialEntity.parameters"-->
<!--                        :origin="origin"-->
<!--                        @update:name="onTutorialUpdate('name', $event)"-->
<!--                        @update:description="onTutorialUpdate('description', $event)"-->
<!--                        @update:steps="onTutorialUpdate('steps', $event)"-->
<!--                        @update:parameters="onTutorialUpdate('parameters', $event)"-->
<!--                        @update:path="onTutorialUpdate('path', $event)"-->
<!--                    >-->
<!--                    </tutorial-form>-->
<!--                </validation-observer>-->
<!--                <grouped-buttons-layout>-->
<!--                    <back-button-->
<!--                        @click="onClickBack"-->
<!--                    ></back-button>-->
<!--                    <save-button-->
<!--                        @click="onClickSave"-->
<!--                    ></save-button>-->
<!--                </grouped-buttons-layout>-->
<!--            </div>-->
<!--        </b-modal>-->

<!--        &lt;!&ndash;<delete-confirmation-message&ndash;&gt;-->
<!--            &lt;!&ndash;v-if="isDeletingTutorial"&ndash;&gt;-->
<!--            &lt;!&ndash;:tutorial="selectedTutorial"&ndash;&gt;-->
<!--            &lt;!&ndash;@closeClick="updateState('beingHome')"&ndash;&gt;-->
<!--            &lt;!&ndash;@deleteClick="onDeleteConfirmTutorialClick"&ndash;&gt;-->
<!--        &lt;!&ndash;&gt;&ndash;&gt;-->
<!--        &lt;!&ndash;</delete-confirmation-message>&ndash;&gt;-->

<!--        &lt;!&ndash;<driver-editor&ndash;&gt;-->
<!--            &lt;!&ndash;ref="editor"&ndash;&gt;-->
<!--            &lt;!&ndash;:steps="selectedTutorial ? selectedTutorial.steps : []"&ndash;&gt;-->
<!--            &lt;!&ndash;:has-selector-choices-available-message="!dontShowMeChecked('selectorChoicesAvailable')"&ndash;&gt;-->
<!--            &lt;!&ndash;:has-click-to-add-step-message="!dontShowMeChecked('clickToAddStep')"&ndash;&gt;-->
<!--            &lt;!&ndash;:is-highlight-selection-active="isAddingStep"&ndash;&gt;-->
<!--            &lt;!&ndash;@saveClick="onEditorSaveClick"&ndash;&gt;-->
<!--            &lt;!&ndash;@cancelClick="onEditorCancelClick"&ndash;&gt;-->
<!--            &lt;!&ndash;@previewDone="updateState('beingHome')"&ndash;&gt;-->
<!--            &lt;!&ndash;@editDone="updateState('beingHome')"&ndash;&gt;-->
<!--            &lt;!&ndash;@dontShowMeChange="removeMessage"&ndash;&gt;-->
<!--        &lt;!&ndash;&gt;&ndash;&gt;-->
<!--        &lt;!&ndash;</driver-editor>&ndash;&gt;-->

<!--        &lt;!&ndash;&lt;!&ndash;<message&ndash;&gt;&ndash;&gt;-->
<!--            &lt;!&ndash;&lt;!&ndash;v-show="showUrlChangeAlert && requestState === 'REQUEST_LIST_TUTORIALS'"&ndash;&gt;&ndash;&gt;-->
<!--            &lt;!&ndash;&lt;!&ndash;is-warning&ndash;&gt;&ndash;&gt;-->
<!--            &lt;!&ndash;&lt;!&ndash;@closeClick="$emit('update:show-url-change-alert', false)"&ndash;&gt;&ndash;&gt;-->
<!--        &lt;!&ndash;&lt;!&ndash;&gt;&ndash;&gt;&ndash;&gt;-->
<!--            &lt;!&ndash;&lt;!&ndash;<template slot="header">Alert</template>&ndash;&gt;&ndash;&gt;-->
<!--            &lt;!&ndash;&lt;!&ndash;<template slot="body">&ndash;&gt;&ndash;&gt;-->
<!--               &lt;!&ndash;&lt;!&ndash;Tutorials must be created per URL.<br>&ndash;&gt;&ndash;&gt;-->
<!--                &lt;!&ndash;&lt;!&ndash;Now fetching tutorials for this page.&ndash;&gt;&ndash;&gt;-->
<!--            &lt;!&ndash;&lt;!&ndash;</template>&ndash;&gt;&ndash;&gt;-->
<!--        &lt;!&ndash;&lt;!&ndash;</message>&ndash;&gt;&ndash;&gt;-->

<!--        &lt;!&ndash;&lt;!&ndash;<loading-modal&ndash;&gt;&ndash;&gt;-->
<!--            &lt;!&ndash;&lt;!&ndash;v-show="isRequesting && requestState !== 'REQUEST_LIST_TUTORIALS'"&ndash;&gt;&ndash;&gt;-->
<!--        &lt;!&ndash;&lt;!&ndash;&gt;</loading-modal>&ndash;&gt;&ndash;&gt;-->

<!--        &lt;!&ndash;<project-not-found-modal&ndash;&gt;-->
<!--            &lt;!&ndash;v-show="showProjectNotFoundModal"&ndash;&gt;-->
<!--            &lt;!&ndash;@click:retry="$emit('click:retry')"&ndash;&gt;-->
<!--            &lt;!&ndash;:isRequesting="isRequesting"&ndash;&gt;-->
<!--        &lt;!&ndash;&gt;&ndash;&gt;-->
<!--        &lt;!&ndash;</project-not-found-modal>&ndash;&gt;-->
<!--    </div>-->
<!--</template>-->
<!--<script>-->
<!--    import { ValidationObserver } from 'vee-validate'-->
<!--    import { mapActions } from 'vuex'-->
<!--    import Setting from '../../organisms/Setting'-->
<!--    import DriverEditor from "../../organisms/DriverEditor"-->
<!--    import Message from "../../molecules/Message";-->
<!--    import ProjectNotFoundModal from "../../organisms/ProjectNotFoundModal";-->
<!--    import TutorialEntity from "../../../../../js/components/atoms/Entities/TutorialEntity";-->
<!--    import ProjectEntity from "../../../../../js/components/atoms/Entities/ProjectEntity";-->
<!--    import TutorialTable from "../../../../../js/components/organisms/TutorialTable";-->
<!--    import TutorialForm from "../../../../../js/components/organisms/forms/TutorialForm/TutorialForm";-->
<!--    import GroupedButtonsLayout from "../../../../../js/components/layouts/GroupedButtonsLayout";-->
<!--    import SaveButton from "../../../../../js/components/atoms/buttons/SaveButton";-->
<!--    import BackButton from "../../../../../js/components/atoms/buttons/BackButton";-->
<!--    import Heading from "../../../../../js/components/atoms/Heading/Heading";-->

<!--    export const states = {-->
<!--        beingHome: 'beingHome',-->
<!--        addingTutorial: 'addingTutorial',-->
<!--        editingTutorial: 'editingTutorial',-->
<!--        deletingTutorial: 'deletingTutorial',-->
<!--        addingStep: 'addingStep',-->
<!--        editingStep: 'editingStep',-->
<!--        previewing: 'previewing',-->
<!--    }-->

<!--    export default {-->
<!--        name: 'TutorialsTemplate',-->
<!--        components: {-->
<!--            Heading,-->
<!--            BackButton,-->
<!--            SaveButton,-->
<!--            GroupedButtonsLayout,-->
<!--            TutorialForm,-->
<!--            TutorialTable,-->
<!--            ValidationObserver,-->
<!--            ProjectNotFoundModal,-->
<!--            Message,-->
<!--            DriverEditor,-->
<!--            Setting,-->
<!--        },-->
<!--        props: {-->
<!--            projectEntity: {-->
<!--                type: Object,-->
<!--                default() {-->
<!--                    return new ProjectEntity()-->
<!--                }-->
<!--            },-->
<!--            tutorialEntities: {-->
<!--                type: Array,-->
<!--                default() {-->
<!--                    return []-->
<!--                }-->
<!--            },-->
<!--            query: {-->
<!--                type: String,-->
<!--                default: null,-->
<!--            },-->
<!--            pagination: {-->
<!--                type: Object,-->
<!--                default() {-->
<!--                    return {}-->
<!--                }-->
<!--            },-->
<!--            total: {-->
<!--                type: Number,-->
<!--                default: 0,-->
<!--            },-->
<!--            isRequesting: {-->
<!--                type: Boolean,-->
<!--                default: false,-->
<!--            },-->
<!--            extLog: {-->
<!--                type: Object,-->
<!--                default() {-->
<!--                    return {};-->
<!--                },-->
<!--            },-->
<!--            showProjectNotFoundModal: {-->
<!--                type: Boolean,-->
<!--                default: false,-->
<!--            },-->
<!--        },-->
<!--        data() {-->
<!--            return {-->
<!--                state: states.beingHome,-->
<!--                messageShown: null,-->
<!--                menuIsOnTheRight: true,-->
<!--                innerTutorialEntity: new TutorialEntity()-->
<!--            }-->
<!--        },-->
<!--        methods: {-->
<!--            ...mapActions([-->
<!--                'retrieveLog',-->
<!--                'saveLog'-->
<!--            ]),-->
<!--            updateState(state = null) {-->
<!--                if (Object.values(states).includes(state)) {-->
<!--                    this.state = state-->
<!--                }-->
<!--            },-->
<!--            dontShowMeChecked(messageKey) {-->
<!--                return (this.extLog.checkedMessages && this.extLog.checkedMessages.includes(messageKey));-->
<!--            },-->
<!--            removeMessage({ messageKey, value }) {-->
<!--                if (value) {-->
<!--                    this.saveLog({-->
<!--                        checkedMessages: [-->
<!--                            ...this.extLog.checkedMessages,-->
<!--                            messageKey,-->
<!--                        ]-->
<!--                    })-->
<!--                } else {-->
<!--                    const index = this.extLog.checkedMessages.findIndex(key => key === messageKey)-->
<!--                    this.saveLog({-->
<!--                        checkedMessages: [-->
<!--                            ...this.extLog.checkedMessages.slice(0, index),-->
<!--                            ...this.extLog.checkedMessages.slice(index+1),-->
<!--                        ]-->
<!--                    })-->
<!--                }-->
<!--            },-->
<!--            onAddStepClick() {-->
<!--                this.addUserScreenClickHandler()-->
<!--                this.updateState(states.addingStep)-->
<!--            },-->
<!--            onEditorSaveClick(step) {-->
<!--                this.removeUserScreenClickHandler()-->
<!--                this.$emit('stepSaveClick', step)-->
<!--                this.updateState(states.beingHome)-->
<!--            },-->
<!--            onEditorCancelClick() {-->
<!--                this.removeUserScreenClickHandler()-->
<!--                this.updateState(states.beingHome)-->
<!--            },-->
<!--            addUserScreenClickHandler() {-->
<!--                document.querySelectorAll( 'body *' ).forEach(el => {-->
<!--                    if (el.tagName === 'A') {-->
<!--                        el.style.pointerEvents = 'none';-->
<!--                        el.style.cursor = 'default';-->
<!--                    }-->
<!--                    el.addEventListener('click', this.$refs.editor.userScreenClickHandler)-->
<!--                })-->
<!--            },-->
<!--            removeUserScreenClickHandler() {-->
<!--                document.querySelectorAll( 'body *' ).forEach(el => {-->
<!--                    if (el.tagName === 'A') {-->
<!--                        el.style.pointerEvents = null;-->
<!--                        el.style.cursor = null;-->
<!--                    }-->
<!--                    el.removeEventListener('click', this.$refs.editor.userScreenClickHandler)-->
<!--                })-->
<!--            },-->
<!--            onAddTutorialClick() {-->
<!--                this.innerTutorialEntity = new TutorialEntity()-->
<!--                this.$refs.observer.reset()-->
<!--                this.updateState(states.addingTutorial)-->
<!--            },-->
<!--            onDeleteTutorialClick() {-->
<!--                this.updateState(states.deletingTutorial)-->
<!--            },-->
<!--            onDeleteConfirmTutorialClick(id) {-->
<!--                this.$emit('deleteTutorialConfirmClick', { id })-->
<!--                this.updateState(states.deletingTutorial)-->
<!--            },-->
<!--            onTutorialUpdate(key, value) {-->
<!--                this.innerTutorialEntity = new TutorialEntity({-->
<!--                    ...this.innerTutorialEntity,-->
<!--                    [key]: value,-->
<!--                })-->
<!--            },-->
<!--            onClickSave() {-->
<!--                this.$refs.observer.validate()-->
<!--                    .then(result => {-->
<!--                        if (result) {-->
<!--                            this.$emit('click:save', this.innerTutorialEntity)-->
<!--                            this.updateState(states.beingHome)-->
<!--                        }-->
<!--                    })-->
<!--                    .catch(error => {-->
<!--                        console.log(error);-->
<!--                    })-->
<!--            },-->
<!--            onClickBack() {-->
<!--                if (this.state === states.addingTutorial) {-->
<!--                    this.innerTutorialEntity = new TutorialEntity()-->
<!--                }-->
<!--                this.updateState(states.beingHome)-->
<!--            },-->
<!--            onEditTutorialClick() {-->
<!--                this.innerTutorialEntity = new TutorialEntity({-->
<!--                    ...this.selectedTutorial,-->
<!--                })-->
<!--                this.updateState(states.editingTutorial)-->
<!--            },-->
<!--            onStepClick(id) {-->
<!--                this.$refs.editor.highlight({ id })-->
<!--                this.updateState(states.editingStep)-->
<!--                this.$emit('stepClick', { id })-->
<!--            },-->
<!--            onDeleteStepClick(id) {-->
<!--                this.$emit('deleteStepClick', { id })-->
<!--            },-->
<!--            onPreviewClick() {-->
<!--                this.updateState(states.previewing)-->
<!--                this.$refs.editor.preview()-->
<!--            },-->
<!--        },-->
<!--        watch: {-->
<!--            tutorialEntities(newValue, oldValue) {-->
<!--                if ((oldValue.length - newValue.length) === 1) {-->
<!--                    this.updateState(states.beingHome)-->
<!--                }-->
<!--            },-->
<!--        },-->
<!--        computed: {-->
<!--            isHome() {-->
<!--                return (this.state === states.beingHome)-->
<!--            },-->
<!--            isAddingStep() {-->
<!--                return (this.state === states.addingStep)-->
<!--            },-->
<!--            isAddingTutorial() {-->
<!--                return (this.state === states.addingTutorial)-->
<!--            },-->
<!--            isEditingTutorial() {-->
<!--                return (this.state === states.editingTutorial)-->
<!--            },-->
<!--            isDeletingTutorial() {-->
<!--                return (this.state === states.deletingTutorial)-->
<!--            },-->
<!--            origin() {-->
<!--                if (this.projectEntity) {-->
<!--                    return `${this.projectEntity.protocol}://${this.projectEntity.domain}`-->
<!--                }-->
<!--                return null;-->
<!--            },-->
<!--        },-->
<!--    }-->
<!--</script>-->
<!--<style scoped>-->
<!--    .menu {-->
<!--        z-index: 10000000;-->
<!--    }-->
<!--    >>> .modal-content {-->
<!--        padding: 30px;-->
<!--    }-->
<!--    @media only screen and (max-width: 600px) {-->
<!--        .menu {-->
<!--            width: 90% !important;-->
<!--        }-->
<!--    }-->
<!--</style>-->
