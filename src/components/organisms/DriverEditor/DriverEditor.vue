<template>
  <div />
</template>

<script>
import finder from '@medv/finder'
import purify from 'dompurify'
import {
  ADD,
  EDIT,
  PREVIEW,
  PREVIEW_DONE,
  SAVE,
  CANCEL,
  ELEMENT_NOT_FOUND,
  RESELECT_ELEMENT,
} from '../../../constants/drvier-editor-command-types'
import StepEntity from '../../atoms/Entities/StepEntity'
import { sendCommand } from '../../../api'

const MAX_RETRIES = 5
export default {
  name: 'DriverEditor',
  data() {
    return {
      driver: null,
      selectorChoices: [],
      selectorChoiceIndex: 0,
      step: new StepEntity(),
      source: null,
      isEditing: false,
    }
  },
  watch: {
    isEditing(value) {
      if (!value) {
        this.driver.reset()
        this.driver.options.allowClose = true
        this.driver.options.editable = false
        this.selectorChoices = []
        this.selectorChoiceIndex = 0
        this.step = new StepEntity()
        this.$emit('editDone')
      }
    },
  },
  created() {
    window.addEventListener('message', this.onReceiveMessage)
    this.driver = new Driver({
      animate: false,
    })
  },
  beforeDestroy() {
    window.removeEventListener('message', this.onReceiveMessage)
  },
  destroyed() {
    this.driver = null
  },
  methods: {
    onReceiveMessage(e) {
      if (e.origin !== window.location.origin) return
      if (typeof e.data !== 'object' || Array.isArray(e.data)) return
      const { app = null, command = null, data = {} } = e.data
      if (app === process.env.VUE_APP_NAME) {
        this.handleCommand(command, data)
        this.source = e.source
      }
    },
    sendCommand(command, data = {}) {
      if (!this.source) return
      this.source.postMessage(
        {
          app: process.env.VUE_APP_NAME,
          command,
          data,
        },
        window.location.origin
      )
    },
    handleCommand(command, data) {
      const { step = {}, steps = [], type = null } = data
      if (command === ADD) {
        this.selectElementToHighlight(type)
      } else if (command === EDIT) {
        this.isEditing = true
        this.step = new StepEntity(step)
        const elementFound = document.querySelector(step.highlightTarget)
        if (elementFound) {
          this.highlight(step.highlightTarget, step.config)
        } else {
          sendCommand(ELEMENT_NOT_FOUND)
        }
      } else if (command === RESELECT_ELEMENT) {
        this.selectElementToHighlight('tooltip')
      } else if (command === PREVIEW) {
        this.preview(steps)
      }
    },
    selectElementToHighlight(type = 'modal') {
      this.isEditing = true
      this.addUserScreenClickHandler()
      if (type === 'modal') {
        this.highlight()
      }
    },
    addUserScreenClickHandler() {
      document.querySelectorAll('body *').forEach(el => {
        if (el.tagName === 'A') {
          el.style.pointerEvents = 'none'
          el.style.cursor = 'default'
        }
        el.addEventListener('click', this.userScreenClickHandler, true)
      })
    },
    removeUserScreenClickHandler() {
      document.querySelectorAll('body *').forEach(el => {
        if (el.tagName === 'A') {
          el.style.pointerEvents = null
          el.style.cursor = null
        }
        el.removeEventListener('click', this.userScreenClickHandler, true)
      })
    },
    getSelector(node) {
      if (node === 'modal') {
        return node
      }
      if (node) {
        return finder(node, {
          root: document.body,
          id: name => !name.includes('driver-'),
          className: name => !name.includes('driver-'),
          tagName: () => true,
          seedMinLength: 5,
          optimizedMinLength: 4,
          threshold: 1000,
        })
      }
      return null
    },
    getDriverConfig() {
      const activeElement = this.driver.getHighlightedElement()
      const popover = activeElement.getPopover()
      const content = purify.sanitize(popover.getContentNode().input)

      const activeNode = activeElement.getNode()
      const selector = this.getSelector(activeNode)
      return {
        element: selector,
        popover: {
          content,
        },
      }
    },
    onClickNext(el) {
      if (this.isEditing) {
        this.onClickSave(el)
      }
    },
    onClickPrevious(el) {
      if (this.isEditing) {
        this.onClickCancel(el)
      }
    },
    onClickCancel(el) {
      this.removeUserScreenClickHandler()
      this.isEditing = false
      this.sendCommand(CANCEL)
    },
    onClickSave(el) {
      this.removeUserScreenClickHandler()
      this.isEditing = false
      const { element, popover } = this.getDriverConfig()
      this.sendCommand(
        SAVE,
        new StepEntity({
          ...this.step,
          highlightTarget: element,
          type: element === 'modal' ? 'modal' : 'tooltip',
          config: popover,
        })
      )
    },
    extractSelectorChoices(e) {
      const upperElements = []
      const lowerElements = []
      e.composedPath().find((el, index) => {
        if (el.tagName.toLowerCase() === 'body') return true
        const selector = this.getSelector(el)
        upperElements.push(selector)
        if (index === 0) {
          Array.from(el.children).forEach(childEl => {
            const selector = this.getSelector(childEl)
            lowerElements.push(selector)
          })
        }
        return false
      })

      return [...lowerElements, ...upperElements]
    },
    userScreenClickHandler(e) {
      e.stopPropagation() // for driver.js

      if (this.isEditing) {
        if (this.selectorChoices.length === 0) {
          this.selectorChoices = this.extractSelectorChoices(e)
          this.showDriverChoice()
        }
      }
    },
    async highlight(
      element = 'modal',
      popover = { content: '<div><h1>Title</h1><div>Description</div></div>' }
    ) {
      return new Promise(resolve => {
        // watchでセットすると遅いのでここでやってる
        this.driver.options.allowClose = false
        this.driver.options.editable = true
        this.driver.defineSteps([
          {
            element,
            popover,
            onNext: el => {
              this.onClickNext(el)
              this.driver.preventMove()
            },
            onPrevious: el => {
              this.onClickPrevious(el)
              this.driver.preventMove()
            },
          },
        ])
        this.driver.start()
        resolve(this.driver.hasHighlightedElement())
      })
    },
    preview(steps = []) {
      this.addUserScreenClickHandler()
      this.driver.options.allowClose = true
      this.driver.options.onReset = () => {
        this.sendCommand(PREVIEW_DONE)
        this.removeUserScreenClickHandler()
      }
      const definedSteps = steps.map(step => ({
        element: step.highlightTarget,
        popover: step.config,
      }))
      this.driver.defineSteps(definedSteps)
      this.driver.start()
    },
    async showDriverChoice() {
      if (this.selectorChoices.length === 0) return
      if (
        this.selectorChoiceIndex === this.selectorChoices.length - 1 ||
        this.selectorChoiceIndex + 1 > MAX_RETRIES
      ) {
        this.selectorChoiceIndex = 0
      }
      const hasHighlightedElement = await this.highlight(
        this.selectorChoices[this.selectorChoiceIndex]
      )
      this.selectorChoiceIndex += 1
      if (!hasHighlightedElement) {
        this.showDriverChoice()
      }
    },
  },
}
</script>

<style scoped></style>
