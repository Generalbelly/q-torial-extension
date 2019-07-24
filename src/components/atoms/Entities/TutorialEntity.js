import Entity from './Entity'
import StepEntity from './StepEntity'
import { validateUrlPath } from './PathOperators'
import { has } from '../../../utils'

export default class TutorialEntity extends Entity {
  name = null

  description = null

  domain = null

  pathOperator = 'EQUALS'

  pathValue = null

  parameters = []

  settings = {}

  buildUrl = null

  isActive = false

  steps = []

  constructor(data = {}) {
    super()
    const { steps = [], ...props } = data

    this.fill(props)
    this.steps = steps.map(step => new StepEntity(step))
  }

  toPlainObject() {
    const privateProperty = [
      'createdAtAsDateString',
      'updatedAtAsDateString',
      'createdAt',
      'updatedAt',
    ]
    const object = {}
    Object.keys(this).forEach(propertyName => {
      if (propertyName === 'steps') {
        object[propertyName] = this.steps.map(step => step.toPlainObject())
      } else if (
        !privateProperty.includes(propertyName) &&
        has.call(this, propertyName)
      ) {
        object[propertyName] = this[propertyName]
      }
    })
    return object
  }

  couldBeShownOn(urlPath) {
    return validateUrlPath(this.pathOperator, this.pathValue, urlPath)
  }
}
