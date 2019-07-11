import Vue from 'vue'
import Vuex from 'vuex'
import { firestoreAction, vuexfireMutations } from 'vuexfire'
import UserEntity from '../components/atoms/Entities/UserEntity'
import firebase, { FieldValue } from '../firebase'
import { QUERY_LIMIT } from '../constants/general'
import {
  RESET_STATE,
  SELECT_TUTORIAL,
  SET_ACTIVE,
  SET_ALL_FETCHED,
  SET_REQUESTING,
  SET_USER,
  UPDATE_ORDER_BY,
  UPDATE_SEARCH_QUERY,
} from './mutation-types'

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
  [SET_ACTIVE](state, payload) {
    state.active = payload
  },
  [RESET_STATE](state, payload) {
    state.allFetched = false
    state.requesting = false
    state.searchQuery = ''
    state.orderBy = ['createdAt', 'desc']
  },
  [SET_ALL_FETCHED](state, payload) {
    state.allFetched = payload
  },
  [SET_REQUESTING](state, payload) {
    state.requesting = payload
  },
  [UPDATE_SEARCH_QUERY](state, payload) {
    state.searchQuery = payload
    state.tutorials = []
  },
  [UPDATE_ORDER_BY](state, payload) {
    const { orderBy } = payload
    state.orderBy = orderBy
    state.tutorials = []
  },
  [SELECT_TUTORIAL](state, payload) {
    const { id } = payload
    state.selectedTutorialID = id
  },
  ...vuexfireMutations,
}

let tutorialsLatestSnapshot = null
const actions = {
  setUser({ commit }, payload) {
    commit(SET_USER, payload)
  },
  setActive({ commit }, payload) {
    commit(SET_ACTIVE, payload)
  },
  resetState: firestoreAction(({ commit, unbindFirestoreRef }, payload) => {
    unbindFirestoreRef('tutorials')
    unbindFirestoreRef('steps')
    commit(RESET_STATE)
  }),
  listTutorials: firestoreAction(
    async (
      { bindFirestoreRef, state, commit, unbindFirestoreRef },
      payload
    ) => {
      const { searchQuery = null, orderBy = ['createdAt', 'desc'] } = payload
      commit(SET_REQUESTING, true)
      unbindFirestoreRef('steps')

      if (searchQuery !== state.searchQuery) {
        tutorialsLatestSnapshot = null
        commit(UPDATE_SEARCH_QUERY, searchQuery)
        commit(SET_ALL_FETCHED, false)
      }
      if (orderBy[0] !== state.orderBy[0] || orderBy[1] !== state.orderBy[1]) {
        tutorialsLatestSnapshot = null
        commit(UPDATE_ORDER_BY, {
          orderBy,
        })
        commit(SET_ALL_FETCHED, false)
      }

      let snapshot = firebase
        .getDB()
        .collection('users')
        .doc(state.user.uid)
        .collection('tutorials')

      if (state.searchQuery) {
        snapshot = snapshot
          .orderBy('name')
          .startAt(searchQuery)
          .endAt(`${searchQuery}\uf8ff`)
      } else {
        snapshot = snapshot.orderBy(state.orderBy[0], state.orderBy[1])
      }

      if (
        tutorialsLatestSnapshot &&
        tutorialsLatestSnapshot.docs &&
        tutorialsLatestSnapshot.docs.length > 0
      ) {
        snapshot = snapshot.startAfter(
          tutorialsLatestSnapshot.docs[tutorialsLatestSnapshot.docs.length - 1]
        )
      }

      snapshot = snapshot.limit(QUERY_LIMIT)
      await bindFirestoreRef('tutorials', snapshot, {
        maxRefDepth: 1,
        reset: true,
      })
      commit(SET_ALL_FETCHED, snapshot.empty)
      commit(SET_REQUESTING, false)
      if (!tutorialsLatestSnapshot) {
        tutorialsLatestSnapshot = snapshot
      }
    }
  ),
  selectTutorial: async ({ commit, state, dispatch }, payload) => {
    commit(SET_REQUESTING, true)
    commit(SELECT_TUTORIAL, payload)
    if (state.selectedTutorialID) {
      await dispatch('listSteps')
    }
    commit(SET_REQUESTING, false)
  },
  addTutorial: firestoreAction(
    async ({ commit, state, unbindFirestoreRef }, payload) => {
      commit(SET_REQUESTING, true)
      unbindFirestoreRef('steps')

      const { saveSteps = false, data } = payload
      const { id, steps, ...fields } = data
      const tutorialRef = await firebase
        .getDB()
        .collection('users')
        .doc(state.user.uid)
        .collection('tutorials')
        .add({
          ...fields,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        })
      if (saveSteps) {
        const stepsRef = tutorialRef.collection('steps')
        await Promise.all(
          steps.map(({ id = null, ...stepFields }) =>
            stepsRef.add({
              ...stepFields,
              createdAt: FieldValue.serverTimestamp(),
              updatedAt: FieldValue.serverTimestamp(),
            })
          )
        )
      }
      commit(SET_REQUESTING, false)
    }
  ),
  updateTutorial: async ({ commit, state }, payload) => {
    commit(SET_REQUESTING, true)
    const { saveSteps = false, data } = payload
    const { id, steps, ...fields } = data
    const tutorialRef = await firebase
      .getDB()
      .collection('users')
      .doc(state.user.uid)
      .collection('tutorials')
      .doc(id)
      .update({
        ...fields,
        updatedAt: FieldValue.serverTimestamp(),
      })
    if (saveSteps) {
      const stepsRef = tutorialRef.collection('steps')
      await Promise.all(
        steps.map(({ id = null, ...stepFields }) => {
          if (id) {
            return stepsRef.doc(id).update({
              ...stepFields,
              updatedAt: FieldValue.serverTimestamp(),
            })
          }
          return stepsRef.add({
            ...stepFields,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          })
        })
      )
    }
    commit(SET_REQUESTING, false)
  },
  deleteTutorial: firestoreAction(
    async ({ commit, state, unbindFirestoreRef }, payload) => {
      commit(SET_REQUESTING, true)
      unbindFirestoreRef('steps')
      const { data } = payload
      const { id } = data
      await firebase
        .getDB()
        .collection('users')
        .doc(state.user.uid)
        .collection('tutorials')
        .doc(id)
        .delete()
      commit(SET_REQUESTING, false)
    }
  ),
  listSteps: firestoreAction(
    async ({ bindFirestoreRef, commit, state }, payload) => {
      commit(SET_REQUESTING, true)
      const snapshot = firebase
        .getDB()
        .collection('users')
        .doc(state.user.uid)
        .collection('tutorials')
        .doc(state.selectedTutorialID)
        .collection('steps')
        .orderBy('order')

      await bindFirestoreRef('steps', snapshot)
      commit(SET_REQUESTING, false)
    }
  ),
  addStep: async ({ commit, state }, payload) => {
    commit(SET_REQUESTING, true)
    const { data } = payload
    const { id, ...fields } = data

    await firebase
      .getDB()
      .collection('users')
      .doc(state.user.uid)
      .collection('tutorials')
      .doc(state.selectedTutorialID)
      .collection('steps')
      .add({
        ...fields,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })
    commit(SET_REQUESTING, false)
  },
  updateStep: async ({ commit, state }, payload) => {
    const { data } = payload
    const { id, ...fields } = data
    commit(SET_REQUESTING, true)
    await firebase
      .getDB()
      .collection('users')
      .doc(state.user.uid)
      .collection('tutorials')
      .doc(state.selectedTutorialID)
      .collection('steps')
      .doc(id)
      .update({
        ...fields,
        updatedAt: FieldValue.serverTimestamp(),
      })
    commit(SET_REQUESTING, false)
  },
  deleteStep: async ({ commit, state }, payload) => {
    const { data } = payload
    const { id } = data
    commit(SET_REQUESTING, true)
    await firebase
      .getDB()
      .collection('users')
      .doc(state.user.uid)
      .collection('tutorials')
      .doc(state.selectedTutorialID)
      .collection('steps')
      .doc(id)
      .delete()
    commit(SET_REQUESTING, false)
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
  steps: [],
  selectedTutorialID: null,
  serverSideErrors: {},
}

const getters = {
  // eslint-disable-next-line no-shadow
  tutorial(state) {
    if (state.selectedTutorialID) {
      const tutorial = state.tutorials.find(
        t => t.id === state.selectedTutorialID
      )
      return {
        ...tutorial,
        id: tutorial.id,
        steps: state.steps.map(step => ({
          id: step.id,
          ...step,
        })),
      }
    }
    return null
  },
}

export default new Vuex.Store({
  state,
  mutations,
  actions,
  getters,
  // strict: process.env.NODE_ENV !== 'production',
})
