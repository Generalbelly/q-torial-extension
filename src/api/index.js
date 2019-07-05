import { UPDATE_STATE } from '../constants/command-types'

export const sendCommand = (c, d = {}) => {
  return new Promise(resolve => {
    console.log(new Date().getTime(), c)
    console.log('data', d)
    window.addEventListener('message', event => {
      if (event.origin !== window.parent.location.origin) return
      if (typeof event.data !== 'object' || Array.isArray(event.data)) return
      const { app = null, command = '', data = {} } = event.data
      if (app === process.env.VUE_APP_NAME && command === UPDATE_STATE) {
        console.log('received data', data)
        resolve(data)
      }
    })
    window.parent.postMessage(
      {
        app: process.env.VUE_APP_NAME,
        command: c,
        data: d,
      },
      window.parent.location.origin
    )
  })
}
