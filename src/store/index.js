import Vue from 'vue'
import Vuex from 'vuex'
import {
  SET_USER,
  SELECT_TUTORIAL,
  SET_SERVER_SIDE_ERRORS,
  SYNC_DATA,
  SORT_TUTORIALS,
  SET_REQUESTING,
} from './mutation-types'
import UserEntity from '../components/atoms/Entities/UserEntity'
import { sendCommand } from '../api'
import { PASS_DATA_TO_VUEX } from '../constants/command-types'
import TutorialEntity from '../components/atoms/Entities/TutorialEntity'

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
  [SELECT_TUTORIAL](state, payload) {
    state.selectedTutorialID = payload.id
  },
  [SYNC_DATA](state, payload) {
    state.allFetched = payload.allFetched
    state.requesting = payload.requesting
    state.searchQuery = payload.searchQuery
    state.orderBy = payload.orderBy
    // When user created their first tutorial.
    // This should be moved to inside upsert tutorial action, if I find a way to communicate with the extension using promise.
    const stateTutorialLength = state.tutorials.length
    const payloadTutorialLength = payload.tutorials.length
    state.tutorials = payload.tutorials.map(
      tutorial => new TutorialEntity(tutorial)
    )
    if (
      stateTutorialLength === 0 &&
      payloadTutorialLength === 1 &&
      !state.selectedTutorialID
    ) {
      state.selectedTutorialID = state.tutorials[0].id
    }
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
  selectTutorial({ commit }, payload) {
    commit(SELECT_TUTORIAL, payload)
  },
  listTutorials({ commit, state }, payload) {
    if (state.user) {
      commit(SET_REQUESTING, true)
      sendCommand(PASS_DATA_TO_VUEX, {
        action: 'tutorial/listTutorials',
        payload: {
          userID: state.user.uid,
          searchQuery: state.searchQuery,
          orderBy: state.orderBy,
          ...payload,
        },
      })
    }
  },
  upsertTutorial({ commit, state }, payload) {
    if (state.user) {
      commit(SET_REQUESTING, true)
      sendCommand(PASS_DATA_TO_VUEX, {
        action: `tutorial/${payload.id ? 'update' : 'add'}Tutorial`,
        payload: {
          userID: state.user.uid,
          data: payload,
        },
      })
    }
  },
  upsertStep({ commit, state, getters }, payload) {
    if (state.user) {
      commit(SET_REQUESTING, true)
      sendCommand(PASS_DATA_TO_VUEX, {
        action: `tutorial/${payload.id ? 'update' : 'add'}Step`,
        payload: {
          userID: state.user.uid,
          tutorialID: getters.tutorial.id,
          data: payload,
        },
      })
    }
  },
  syncData({ commit }, payload) {
    commit(SYNC_DATA, payload)
    commit(SET_REQUESTING, false)
  },
  setServerSideErrors({ commit }, payload) {
    commit(SET_SERVER_SIDE_ERRORS, payload)
  },
}

const getters = {
  tutorial(state) {
    return state.selectedTutorialID
      ? state.tutorials.find(t => t.id === state.selectedTutorialID)
      : null
  },
}

const state = {
  user: null,
  allFetched: false,
  requesting: false,
  searchQuery: '',
  orderBy: ['createdAt', 'desc'],
  tutorials: [],
  selectedTutorialID: null,
  serverSideErrors: {},
}

export default new Vuex.Store({
  state,
  mutations,
  actions,
  getters,
  // strict: process.env.NODE_ENV !== 'production',
})
