import store from '../store'
import { UPDATE_DATA } from '../constants/command-types'

export const sendCommand = (command, data = {}) => {
  console.log('sendCommand', command)
  console.log('data', data)
  window.parent.postMessage(
    {
      app: process.env.VUE_APP_NAME,
      command,
      data,
    },
    window.parent.location.origin
  )
}

const handleCommand = async (command, data) => {
  console.log('handleCommand', command)
  console.log('data', data)
  switch (command) {
    case UPDATE_DATA:
      await store.dispatch('syncData', data)
      break
    default:
      break
  }
}

const onReceiveMessage = async event => {
  if (event.origin !== window.parent.location.origin) return
  if (typeof event.data !== 'object' || Array.isArray(event.data)) return
  const { app = null, command = null, data = {} } = event.data
  if (app === process.env.VUE_APP_NAME) {
    await handleCommand(command, data)
  }
}

const onLoad = () => {
  window.addEventListener('message', onReceiveMessage)
}

window.addEventListener('load', onLoad)
