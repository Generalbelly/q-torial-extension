import Entity from './Entity'
import StepEntity from './StepEntity'
import { validateTutorialPath } from './PathOperators'
import { has } from '../../../utils'

export default class TutorialEntity extends Entity {
  name = null

  description = null

  domain = null

  pathOperator = 'EQUALS'

  pathValue = null

  parameters = []

  settings = {}

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
    return (
      validateTutorialPath(this.pathOperator, this.pathValue, urlPath) ||
      this.steps.some(step =>
        validateTutorialPath(step.pathOperator, step.pathValue, urlPath)
      )
    )
  }
}
