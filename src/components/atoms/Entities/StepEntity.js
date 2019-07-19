import Entity from './Entity'
import { validateUrlPath } from './PathOperators'

export default class StepEntity extends Entity {
  type = 'tooltip' // tooltip, modal

  triggerTarget = null // window #id, .class

  triggerEvent = null // load, click, focus, error, null

  highlightTarget = null // #id, .class, modal

  waitingTime = 0

  config = {}

  order = 0

  pathOperator = 'EQUALS' // ALL, EQUALS, STARTS_WITH, ENDS_WITH, CONTAINS, REGEX, NOT_EQUALS

  pathValue = null

  parameters = []

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
