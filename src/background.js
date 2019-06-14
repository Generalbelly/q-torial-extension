import browser from 'webextension-polyfill'
import {
  START_APP,
  SIGN_IN,
  SIGN_OUT,
  VERSION,
  REDIRECT_USER,
  UPDATE_AUTH_STATE,
  PASS_DATA_TO_VUEX,
  UPDATE_DATA,
} from './constants/command-types'
import { ERROR, OK } from './constants/status-types'
import firebase from './firebase'
import store from './backgroundStore'
import { RESET_STATE } from './backgroundStore/mutation-types'

global.browser = browser

firebase.init({
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VUE_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
})

chrome.runtime.onConnect.addListener(async port => {
  if (port.name !== process.env.VUE_APP_NAME) return
  let connected = true
  port.onDisconnect.addListener(() => {
    connected = false
  })

  const sendCommand = (command, data) => {
    if (!connected) return
    port.postMessage({
      command,
      data,
    })
  }

  const startApp = async (resetState = false) => {
    if (resetState) {
      store.commit(`tutorial/${RESET_STATE}`)
    }
    const user = await firebase.checkAuth()
    if (user) {
      sendCommand(START_APP)
    } else {
      sendCommand(REDIRECT_USER)
    }
  }

  firebase.watchAuth(async user => {
    sendCommand(UPDATE_AUTH_STATE, user)
  })

  chrome.browserAction.onClicked.addListener(async () => {
    // TODO activeとそうじゃないときにアイコンの色を変更する
    await store.dispatch('setActive', !store.state.active)
    await startApp(true)
  })

  store.watch(
    state => state.tutorial,
    value => {
      const { requesting } = value
      console.log('watch', value)
      if (!requesting) {
        console.log('send', value)
        sendCommand(UPDATE_DATA, value)
      }
    },
    { deep: true }
  )

  const user = await firebase.checkAuth()
  if (user && store.state.active) {
    await startApp()
  }

  port.onMessage.addListener(async request => {
    const { status, command = null, data = null } = request
    if (status === ERROR) {
      console.log(request)
    }
    if (command) {
      switch (command) {
        case PASS_DATA_TO_VUEX:
          await store.dispatch(data.action, data.payload)
          break
        default:
          break
      }
    }
  })
})

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
      default:
        throw Error('unknown command')
    }
    return true
  }
)

window.onload = async () => {
  await store.dispatch('setActive', false)
}
