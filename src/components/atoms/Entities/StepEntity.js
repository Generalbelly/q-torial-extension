import Entity from './Entity'
import { validateUrlPath } from './PathOperators'

export default class StepEntity extends Entity {
  type = 'tooltip' // tooltip, modal

  trigger = {
    target: 'window', // window #id, .class
    event: 'load', // load, click, focus, error, null
    waitingTime: 0,
  }

  highlightTarget = null // #id, .class, modal

  config = {
    content: null,
    nextBtnText: 'Next',
    prevBtnText: 'Previous',
    showButtons: true,
    doneBtnText: 'Done',
    closeBtnText: 'Close',
  }

  order = 0

  pathOperator = 'EQUALS' // ALL, EQUALS, STARTS_WITH, ENDS_WITH, CONTAINS, REGEX, NOT_EQUALS

  pathValue = null

  // parameters = []

  constructor(data = {}) {
    super()
    this.fill(data)
  }

  toPlainObject() {
    return super.toPlainObject([
      'createdAtAsDateString',
      'updatedAtAsDateString',
      'createdAt',
      'updatedAt',
    ])
  }

  couldBeShownOn(urlPath) {
    return validateUrlPath(this.pathOperator, this.pathValue, urlPath)
  }
}
