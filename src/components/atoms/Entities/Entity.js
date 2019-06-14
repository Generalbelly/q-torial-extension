import { has } from '../../../utils'

export default class Entity {
  id = null

  fill(data = {}) {
    Object.keys(data).forEach(field => {
      if (has.call(this, field)) {
        this[field] = data[field]
      }
    })
  }

  toPlainObject() {
    const object = {}
    Object.keys(this).forEach(propertyName => {
      if (has.call(this, propertyName)) {
        object[propertyName] = this[propertyName]
      }
    })
    return object
  }
}
