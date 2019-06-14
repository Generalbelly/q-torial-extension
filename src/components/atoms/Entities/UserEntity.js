export default class UserEntity {
  uid = null

  email = null

  displayName = null

  emailVerified = false

  constructor(data = {}) {
    this.fill(data)
  }

  fill(data = {}) {
    Object.keys(data).forEach(field => {
      if (Object.prototype.hasOwnProperty.call(this, field)) {
        this[field] = data[field]
      }
    })
  }
}
