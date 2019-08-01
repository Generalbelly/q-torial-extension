import Vue from 'vue'
import Vuex from 'vuex'
import {
  SET_USER,
  SET_SERVER_SIDE_ERRORS,
  SYNC_DATA,
  UPDATE_TUTORIAL,
  SORT_TUTORIALS,
  SET_REQUESTING,
} from './mutation-types'
import UserEntity from '../components/atoms/Entities/UserEntity'
import { sendCommand } from '../api'
import { PASS_DATA_TO_BACKGROUND } from '../constants/command-types'
import TutorialEntity from '../components/atoms/Entities/TutorialEntity'
import { has } from '../utils'

Vue.use(Vuex)

const mutations = {
  [SET_USER](state, payload) {
    if (payload) {
      state.user = new UserEntity({
        ...state.user,
        ...payload,
      })
    } else {
      state.user = null
    }
  },
  [SET_SERVER_SIDE_ERRORS](state, payload) {
    state.serverSideErrors = payload
  },
  [SYNC_DATA](state, payload) {
    Object.keys(payload).forEach(key => {
      if (has.call(state, key)) {
        if (key === 'tutorials' && payload.tutorials.length > 0) {
          state.tutorials = payload.tutorials.map(
            tutorial => new TutorialEntity(tutorial)
          )
        } else if (key === 'tutorial' && payload.tutorial) {
          state.tutorial = new TutorialEntity(payload.tutorial)
        } else {
          state[key] = payload[key]
        }
      }
    })
    console.log(SYNC_DATA, state)
  },
  [SORT_TUTORIALS](state, payload) {
    const [field, direction] = payload
    state.tutorials = [...state.tutorials].sort((a, b) => {
      if (a[field] === b[field]) return 0
      if (direction === 'desc') {
        return a[field] < b[field] ? 1 : -1
      }
      return a[field] > b[field] ? 1 : -1
    })
  },
  [SET_REQUESTING](state, payload) {
    state.requesting = payload
  },
}

const actions = {
  setUser({ commit }, payload) {
    commit(SET_USER, payload)
  },
  sortTutorials({ commit }, payload) {
    commit(SORT_TUTORIALS, payload)
  },
  selectTutorial({ commit, dispatch, state }, payload) {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await sendCommand(PASS_DATA_TO_BACKGROUND, {
          action: 'selectTutorial',
          payload,
        })
        commit(SYNC_DATA, data)
        resolve()
      } catch (e) {
        console.error(e)
        reject(e)
      }
    })
  },
  listTutorials: async ({ commit, state }, payload) => {
    if (state.user) {
      commit(SET_REQUESTING, true)
      const data = await sendCommand(PASS_DATA_TO_BACKGROUND, {
        action: 'listTutorials',
        payload: {
          searchQuery: state.searchQuery,
          orderBy: state.orderBy,
          ...payload,
        },
      })
      commit(SYNC_DATA, data)
      commit(SET_REQUESTING, false)
    }
  },
  addTutorial: async ({ commit, state, dispatch }, payload) => {
    if (state.user) {
      commit(SET_REQUESTING, true)
      const data = await sendCommand(PASS_DATA_TO_BACKGROUND, {
        action: `addTutorial`,
        payload: {
          data: payload,
          saveSteps: true,
        },
      })
      commit(SYNC_DATA, data)
      commit(SET_REQUESTING, false)
    }
  },
  updateTutorial: async ({ commit, state }, payload) => {
    if (state.user) {
      commit(SET_REQUESTING, true)
      const data = await sendCommand(PASS_DATA_TO_BACKGROUND, {
        action: `updateTutorial`,
        payload: {
          data: payload,
        },
      })
      commit(SYNC_DATA, data)
      commit(SET_REQUESTING, false)
    }
  },
  deleteTutorial: async ({ commit, state }, payload) => {
    if (state.user) {
      commit(SET_REQUESTING, true)
      const data = await sendCommand(PASS_DATA_TO_BACKGROUND, {
        action: `deleteTutorial`,
        payload: {
          data: payload,
        },
      })
      commit(SYNC_DATA, data)
      commit(SET_REQUESTING, false)
    }
  },
  upsertStep: async ({ commit, state }, payload) => {
    if (state.user) {
      commit(SET_REQUESTING, true)
      const data = await sendCommand(PASS_DATA_TO_BACKGROUND, {
        action: `${payload.id ? 'update' : 'add'}Step`,
        payload: {
          data: payload,
        },
      })
      commit(SYNC_DATA, data)
      commit(SET_REQUESTING, false)
    }
  },
  addStep: async ({ commit, state }, payload) => {
    if (state.user) {
      commit(SET_REQUESTING, true)
      const data = await sendCommand(PASS_DATA_TO_BACKGROUND, {
        action: 'updateTutorial',
        payload: {
          data: payload,
          saveTutorial: false,
          saveSteps: true,
        },
      })
      commit(SYNC_DATA, data)
      commit(SET_REQUESTING, false)
    }
  },
  updateStep: async ({ commit, state }, payload) => {
    if (state.user) {
      commit(SET_REQUESTING, true)
      const data = await sendCommand(PASS_DATA_TO_BACKGROUND, {
        action: 'updateStep',
        payload: {
          data: payload,
        },
      })
      commit(SYNC_DATA, data)
      commit(SET_REQUESTING, false)
    }
  },
  deleteStep: async ({ commit, state }, payload) => {
    if (state.user) {
      commit(SET_REQUESTING, true)
      const data = await sendCommand(PASS_DATA_TO_BACKGROUND, {
        action: 'deleteStep',
        payload: {
          data: payload,
        },
      })
      commit(SYNC_DATA, data)
      commit(SET_REQUESTING, false)
    }
  },
  syncData({ commit, state }, payload = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        let data = {}
        if (state.user) {
          commit(SET_REQUESTING, true)
          data = await sendCommand(SYNC_DATA)
          commit(SYNC_DATA, data)
          commit(SET_REQUESTING, false)
        }
        resolve(data)
      } catch (e) {
        console.error(e)
        reject(e)
      }
    })
  },
  setServerSideErrors({ commit }, payload) {
    commit(SET_SERVER_SIDE_ERRORS, payload)
  },
}

const state = {
  user: null,
  active: false,
  allFetched: false,
  requesting: false,
  searchQuery: '',
  orderBy: ['createdAt', 'desc'],
  tutorials: [],
  tutorial: null,
  serverSideErrors: {},
}

export default new Vuex.Store({
  state,
  mutations,
  actions,
  // strict: process.env.NODE_ENV !== 'production',
})
