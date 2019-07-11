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
  [UPDATE_TUTORIAL](state, payload) {
    const { id = null, ...data } = payload
    const index = state.tutorials.findIndex(tutorial => tutorial.id === id)
    if (index === -1) return
    const tutorial = new TutorialEntity({
      ...state.tutorials[index],
      ...data,
    })
    state.tutorials = [
      ...state.tutorials.slice(0, index),
      tutorial,
      ...state.tutorials.slice(index + 1),
    ]
    state.tutorial = tutorial
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
        const { tutorial } = data
        commit(UPDATE_TUTORIAL, tutorial)
        resolve(tutorial)
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
  // listSteps: async ({ commit, state, getters }, payload = {}) => {
  //   if (state.user) {
  //     commit(SET_REQUESTING, true)
  //     const data = await sendCommand(PASS_DATA_TO_BACKGROUND, {
  //       action: 'listSteps',
  //       payload,
  //     })
  //     const { tutorial } = data
  //     commit(UPDATE_TUTORIAL, tutorial)
  //     commit(SET_REQUESTING, false)
  //   }
  // },
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
      const { tutorials } = data
      const addedTutorial = tutorials
        .map(tutorial => tutorial)
        .sort((a, b) => (a.createdAt.seconds < b.createdAt.seconds ? 1 : -1))[0]
      commit(SYNC_DATA, {
        tutorials,
      })
      commit(SET_REQUESTING, false)
      await dispatch('selectTutorial', addedTutorial)
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
      const { tutorial, tutorials } = data
      commit(SYNC_DATA, {
        tutorial,
        tutorials,
      })
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
      const { tutorial, tutorials } = data
      commit(SYNC_DATA, {
        tutorial,
        tutorials,
      })
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
      const { tutorial } = data
      commit(UPDATE_TUTORIAL, tutorial)
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
      const { tutorial } = data
      commit(UPDATE_TUTORIAL, tutorial)
      commit(SET_REQUESTING, false)
    }
  },
  syncData({ commit, state }, payload) {
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
