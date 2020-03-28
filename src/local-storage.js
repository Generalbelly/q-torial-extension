const createStore = logKey => {
  let log = {};
  try {
    log = JSON.parse(localStorage.getItem(logKey)) || {};
  } catch (e) {
    console.error(e);
  }
  return {
    set(key, value) {
      try {
        log = {
          ...log,
          [key]: value,
        };
        localStorage.setItem(logKey, JSON.stringify(log));
        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    },
    /**
     * @param key string
     * @param defaultValue string|int|object|null
     * @return string|int|boolean|object|null
     *
     */
    get(key, defaultValue = null) {
      return Object.prototype.hasOwnProperty.call(log, key)
        ? log[key]
        : defaultValue;
    },
    clear(key = null) {
      if (key && log[key]) {
        log[key] = null;
      } else {
        log = {};
      }
    },
  };
};

export default createStore;
