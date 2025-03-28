window.history.pushState = (f =>
  function pushState() {
    const ret = f.apply(this, arguments)
    window.dispatchEvent(new Event('locationchange'))
    return ret
  })(window.history.pushState)

window.history.replaceState = (f =>
  function replaceState() {
    const ret = f.apply(this, arguments)
    window.dispatchEvent(new Event('locationchange'))
    return ret
  })(window.history.replaceState)

window.addEventListener('popstate', () => {
  window.dispatchEvent(new Event('locationchange'))
})
