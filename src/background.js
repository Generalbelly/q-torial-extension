import browser from 'webextension-polyfill'
import {
  START_EXT,
  SIGN_IN,
  SIGN_OUT,
  VERSION,
  REDIRECT_TO_APP,
  UPDATE_AUTH_STATE,
  PASS_DATA_TO_BACKGROUND,
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
  //
  // const refineData = data => {
  //   const { requesting, tutorials = [], steps = [], ...meta } = data
  //   return {
  //     ...meta,
  //     tutorials: tutorials.map(tutorial => ({
  //       ...tutorial,
  //       id: tutorial.id,
  //       createdAtAsDateString: tutorial.createdAt
  //         ? tutorial.createdAt.toDate().toLocaleString()
  //         : null,
  //       updatedAtAsDateString: tutorial.updatedAt
  //         ? tutorial.updatedAt.toDate().toLocaleString()
  //         : null,
  //     })),
  //     steps: steps.map(step => ({
  //       ...step,
  //       id: step.id,
  //       createdAtAsDateString: step.createdAt
  //         ? step.createdAt.toDate().toLocaleString()
  //         : null,
  //       updatedAtAsDateString: step.updatedAt
  //         ? step.updatedAt.toDate().toLocaleString()
  //         : null,
  //     })),
  //   }
  // }

  const startApp = async (resetState = false) => {
    if (resetState) {
      await store.dispatch(`resetState`)
    }
    const user = await firebase.checkAuth()
    if (user) {
      sendCommand(START_EXT)
    } else {
      sendCommand(REDIRECT_TO_APP)
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

  // chrome.webNavigation.onHistoryStateUpdated.addListener(data => {
  //   console.log(data)
  // })

  store.watch(
    (state, getters) => ({
      ...state,
      ...getters,
    }),
    value => {
      console.log(value)
      if (!value.requesting) {
        sendCommand(UPDATE_STATE, value)
      }
    },
    { deep: true }
  )

  const user = await firebase.checkAuth()
  if (user && store.state.active) {
    await startApp()
  }

  port.onMessage.addListener(async request => {
    const { status, command = '', data = null } = request
    if (status === ERROR) {
      console.log(request)
    }
    if (command === PASS_DATA_TO_BACKGROUND) {
      await store.dispatch(data.action, data.payload)
    } else if (command === SYNC_DATA) {
      sendCommand(UPDATE_STATE, { ...store.state, ...store.getters })
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
