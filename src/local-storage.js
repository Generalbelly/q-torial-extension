const createStore = logKey => {
  let log = {}
  try {
    log = JSON.parse(localStorage.getItem(logKey)) || {}
  } catch (e) {
    console.error(e)
  }
  return {
    set(key, value) {
      try {
        log = {
          ...log,
          [key]: value,
        }
        localStorage.setItem(logKey, JSON.stringify(log))
        return true
      } catch (e) {
        console.error(e)
        return false
      }
    },
    get(key, defaultValue = null) {
      return Object.prototype.hasOwnProperty.call(log, key)
        ? log[key]
        : defaultValue
    },
    clear(key = null) {
      if (key && log[key]) {
        log[key] = null
      } else {
        log = {}
      }
    },
  }
}

export default createStore
