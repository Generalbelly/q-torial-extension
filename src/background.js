import browser from 'webextension-polyfill'
import {
  START_EXT,
  END_EXT,
  SIGN_IN,
  SIGN_OUT,
  VERSION,
  REDIRECT_TO_APP,
  UPDATE_AUTH_STATE,
  PASS_DATA_TO_BACKGROUND,
  SELECT_TUTORIAL,
  UPDATE_STATE,
} from './constants/command-types'
import { ERROR, OK } from './constants/status-types'
import firebase from './firebase'
import store from './store/backgroundStore'
import { SYNC_DATA } from './store/mutation-types'

global.browser = browser

firebase.init({
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VUE_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
})

const connectHandler = async port => {
  if (port.name !== process.env.VUE_APP_NAME) return

  let connected = true

  function sendCommand(command, data) {
    if (!connected) return
    port.postMessage({
      command,
      data,
    })
  }

  async function startApp(resetState = false) {
    const user = await firebase.checkAuth()
    if (user) {
      if (resetState) {
        await store.dispatch(`resetState`)
      }
      await store.dispatch('setActive', true)
      sendCommand(START_EXT)
    } else {
      sendCommand(REDIRECT_TO_APP)
    }
  }

  async function endApp(resetState = false) {
    if (resetState) {
      await store.dispatch(`resetState`)
    }
    sendCommand(END_EXT)
  }

  const unwatch = store.watch(
    (state, getters) => ({
      ...state,
      ...getters,
    }),
    value => {
      if (!value.requesting) {
        sendCommand(UPDATE_STATE, value)
      }
    },
    { deep: true }
  )

  const unsubscribe = firebase.watchAuth(async user => {
    sendCommand(UPDATE_AUTH_STATE, user)
  })

  const browserActionHandler = async () => {
    if (!store.state.active) {
      await startApp(true)
    } else {
      await endApp()
      await store.dispatch('setActive', false)
    }
  }

  chrome.browserAction.onClicked.addListener(browserActionHandler)

  const onMessageHandler = async request => {
    const { status, command = '', data = {} } = request
    console.log(command)
    console.log(data)
    switch (command) {
      case ERROR:
        console.error(request)
        break
      case PASS_DATA_TO_BACKGROUND:
        await store.dispatch(data.action, data.payload)
        break
      case SYNC_DATA:
        sendCommand(UPDATE_STATE, { ...store.state, ...store.getters })
        break
      case SIGN_IN:
        try {
          await firebase.signIn(data.email, data.password)
        } catch (e) {
          console.error(e)
        }
        break
      case SELECT_TUTORIAL:
        await store.dispatch('selectTutorial', data)
        await store.dispatch('setActive', true)
        sendResponse({
          status: OK,
          message: 'Tutorial is just selected.',
        })
        break
      default:
        break
    }
  }

  port.onMessage.addListener(onMessageHandler)

  port.onDisconnect.addListener(async () => {
    connected = false
    unwatch()
    unsubscribe()
    chrome.browserAction.onClicked.removeListener(browserActionHandler)
    port.onMessage.removeListener(onMessageHandler)
    port.disconnect()
  })

  const user = await firebase.checkAuth()
  if (user && store.state.active) {
    await startApp()
  }
}

chrome.runtime.onConnect.addListener(connectHandler)

chrome.runtime.onMessageExternal.addListener(
  async (request = {}, sender, sendResponse) => {
    const { command = null, data = {} } = request
    switch (command) {
      case SIGN_IN:
        try {
          await firebase.signIn(data.email, data.password)
          sendResponse({ status: OK })
        } catch (e) {
          sendResponse({ status: ERROR, message: e.message })
        }
        break
      case SIGN_OUT:
        try {
          await firebase.signOut()
          sendResponse({ status: OK })
        } catch (e) {
          sendResponse({ status: ERROR, message: e.message })
        }
        break
      case VERSION:
        sendResponse({
          status: OK,
          message: chrome.runtime.getManifest().version,
        })
        break
      case SELECT_TUTORIAL:
        await store.dispatch('selectTutorial', data)
        await store.dispatch('setActive', true)
        sendResponse({
          status: OK,
          message: 'Tutorial is just selected.',
        })
        break
      default:
        throw Error('unknown command')
    }
    return true
  }
)
