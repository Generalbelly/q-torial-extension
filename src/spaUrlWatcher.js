window.history.pushState = (f =>
  function pushState() {
    console.log(arguments)
    const ret = f.apply(this, arguments)
    window.dispatchEvent(new Event('locationchange'))
    return ret
  })(window.history.pushState)

window.history.replaceState = (f =>
  function replaceState() {
    console.log(arguments)
    const ret = f.apply(this, arguments)
    window.dispatchEvent(new Event('locationchange'))
    return ret
  })(window.history.replaceState)

window.addEventListener('popstate', () => {
  window.dispatchEvent(new Event('locationchange'))
})
