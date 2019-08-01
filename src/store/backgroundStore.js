import Vue from 'vue'
import Vuex from 'vuex'
import UserEntity from '../components/atoms/Entities/UserEntity'
import firebase, {
  convertDocToObject,
  convertDocumentsToArray,
  FieldValue,
} from '../firebase'
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
  ADD_TUTORIAL,
  UPDATE_TUTORIAL,
  DELETE_TUTORIAL,
} from './mutation-types'

Vue.use(Vuex)

const mutations = {
  [ADD_TUTORIAL](state, payload) {
    state.tutorials = [...state.tutorials, payload]
  },
  [UPDATE_TUTORIAL](state, payload) {
    const index = state.tutorials.findIndex(
      tutorial => tutorial.id === payload.id
    )
    state.tutorials = [
      ...state.tutorials.slice(0, index),
      {
        ...state.tutorials[index],
        ...payload,
      },
      ...state.tutorials.slice(index + 1),
    ]
  },
  [DELETE_TUTORIAL](state, payload) {
    const index = state.tutorials.findIndex(
      tutorial => tutorial.id === payload.id
    )
    state.tutorials = [
      ...state.tutorials.slice(0, index),
      ...state.tutorials.slice(index + 1),
    ]
  },
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
    state.tutorials = []
    state.tutorial = []
    state.steps = []
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
    state.orderBy = payload
    state.tutorials = []
  },
  [SELECT_TUTORIAL](state, payload) {
    const { id } = payload
    state.selectedTutorialID = id
  },
}

let tutorialsLatestSnapshot = null
const actions = {
  setUser({ commit }, payload) {
    commit(SET_USER, payload)
  },
  setActive({ commit }, payload) {
    commit(SET_ACTIVE, payload)
  },
  resetState({ commit }, payload) {
    commit(RESET_STATE)
  },
  listTutorials: async ({ state, commit }, payload) => {
    const { searchQuery = null, orderBy = ['createdAt', 'desc'] } = payload
    commit(SET_REQUESTING, true)

    if (searchQuery !== state.searchQuery) {
      tutorialsLatestSnapshot = null
      commit(UPDATE_SEARCH_QUERY, searchQuery)
      commit(SET_ALL_FETCHED, false)
    }
    if (orderBy[0] !== state.orderBy[0] || orderBy[1] !== state.orderBy[1]) {
      tutorialsLatestSnapshot = null
      commit(UPDATE_ORDER_BY, orderBy)
      commit(SET_ALL_FETCHED, false)
    }

    let query = firebase
      .getDB()
      .collection('users')
      .doc(state.user.uid)
      .collection('tutorials')

    if (state.searchQuery) {
      query = query
        .orderBy('name')
        .startAt(searchQuery)
        .endAt(`${searchQuery}\uf8ff`)
    } else {
      query = query.orderBy(state.orderBy[0], state.orderBy[1])
    }

    if (
      tutorialsLatestSnapshot &&
      tutorialsLatestSnapshot.docs &&
      tutorialsLatestSnapshot.docs.length > 0
    ) {
      query = query.startAfter(
        tutorialsLatestSnapshot.docs[tutorialsLatestSnapshot.docs.length - 1]
      )
    }

    query = query.limit(QUERY_LIMIT)
    const snapshot = await query.get()
    snapshot.docs.forEach(doc => {
      commit(ADD_TUTORIAL, convertDocToObject(doc))
    })
    commit(SET_ALL_FETCHED, snapshot.empty)
    commit(SET_REQUESTING, false)
    if (!tutorialsLatestSnapshot) {
      tutorialsLatestSnapshot = snapshot
    }
  },
  selectTutorial: async ({ commit, state, getters }, payload) => {
    commit(SET_REQUESTING, true)
    commit(SELECT_TUTORIAL, payload)
    if (state.selectedTutorialID) {
      const snapshot = await firebase
        .getDB()
        .collection('users')
        .doc(state.user.uid)
        .collection('tutorials')
        .doc(state.selectedTutorialID)
        .collection('steps')
        .orderBy('order', 'asc')
        .get()
      commit(UPDATE_TUTORIAL, {
        ...getters.tutorial,
        steps: convertDocumentsToArray(snapshot),
      })
    }
    commit(SET_REQUESTING, false)
  },
  addTutorial: async ({ commit, state }, payload) => {
    commit(SET_REQUESTING, true)

    const batch = firebase.getDB().batch()

    const { data } = payload
    const { id, steps, ...fields } = data
    const tutorialRef = await firebase
      .getDB()
      .collection('users')
      .doc(state.user.uid)
      .collection('tutorials')
      .doc()

    batch.set(tutorialRef, {
      ...fields,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
    const savedSteps = []
    steps.forEach(({ id = null, ...stepFields }, index) => {
      const orderAttachedStep = {
        ...stepFields,
        order: index,
      }
      const stepRef = tutorialRef.collection('steps').doc()
      batch.set(stepRef, {
        ...orderAttachedStep,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })
      savedSteps.push({
        ...orderAttachedStep,
        id: stepRef.id,
      })
    })
    await batch.commit()
    commit(ADD_TUTORIAL, {
      ...fields,
      id: tutorialRef.id,
      steps: savedSteps,
    })
    commit(SET_REQUESTING, false)
  },
  updateTutorial: async ({ commit, state }, payload) => {
    commit(SET_REQUESTING, true)
    const { saveSteps = false, saveTutorial = true, data } = payload
    const { id, steps, ...fields } = data

    const batch = firebase.getDB().batch()

    const tutorialRef = await firebase
      .getDB()
      .collection('users')
      .doc(state.user.uid)
      .collection('tutorials')
      .doc(id)

    if (saveTutorial) {
      batch.update(tutorialRef, {
        ...fields,
        updatedAt: FieldValue.serverTimestamp(),
      })
    }

    const savedSteps = []
    if (saveSteps) {
      steps.forEach(({ id = null, ...stepFields }, index) => {
        const orderAttachedStep = {
          ...stepFields,
          order: index,
        }
        let stepRef
        if (id) {
          stepRef = tutorialRef.collection('steps').doc(id)
          batch.update(stepRef, {
            ...orderAttachedStep,
            updatedAt: FieldValue.serverTimestamp(),
          })
        } else {
          stepRef = tutorialRef.collection('steps').doc()
          batch.set(stepRef, {
            ...orderAttachedStep,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          })
        }
        savedSteps.push({
          ...orderAttachedStep,
          id: stepRef.id,
        })
      })
    }
    await batch.commit()
    commit(UPDATE_TUTORIAL, {
      ...data,
      steps: savedSteps,
    })
    commit(SET_REQUESTING, false)
  },
  deleteTutorial: async ({ commit, state }, payload) => {
    commit(SET_REQUESTING, true)
    const { data } = payload
    const { id } = data
    await firebase
      .getDB()
      .collection('users')
      .doc(state.user.uid)
      .collection('tutorials')
      .doc(id)
      .delete()
    commit(DELETE_TUTORIAL, data)
    commit(SET_REQUESTING, false)
  },
  addStep: async ({ commit, state, getters }, payload) => {
    commit(SET_REQUESTING, true)
    const { data } = payload
    console.log(data)
    const { id, ...fields } = data

    const stepRef = await firebase
      .getDB()
      .collection('users')
      .doc(state.user.uid)
      .collection('tutorials')
      .doc(state.selectedTutorialID)
      .collection('steps')
      .doc()
    stepRef.set({
      ...fields,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })

    commit(UPDATE_TUTORIAL, {
      ...getters.tutorial,
      steps: [
        ...getters.tutorial.steps,
        {
          id: stepRef.id,
          ...fields,
        },
      ],
    })
    commit(SET_REQUESTING, false)
  },
  updateStep: async ({ commit, state, getters }, payload) => {
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

    const index = getters.tutorial.steps.findIndex(step => step.id === id)
    commit(UPDATE_TUTORIAL, {
      ...getters.tutorial,
      steps: [
        ...getters.tutorial.steps.slice(0, index),
        data,
        ...getters.tutorial.steps.slice(index + 1),
      ],
    })

    commit(SET_REQUESTING, false)
  },
  deleteStep: async ({ commit, state, getters }, payload) => {
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

    const index = getters.tutorial.steps.findIndex(step => step.id === id)
    commit(UPDATE_TUTORIAL, {
      ...getters.tutorial,
      steps: [
        ...getters.tutorial.steps.slice(0, index),
        ...getters.tutorial.steps.slice(index + 1),
      ],
    })

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
  selectedTutorialID: null,
  serverSideErrors: {},
}

const getters = {
  // eslint-disable-next-line no-shadow
  tutorial(state) {
    const tutorial = state.tutorials.find(
      tutorial => tutorial.id === state.selectedTutorialID
    )
    return tutorial || null
  },
}

export default new Vuex.Store({
  state,
  mutations,
  actions,
  getters,
  // strict: process.env.NODE_ENV !== 'production',
})
