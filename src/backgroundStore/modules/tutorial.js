import firebase, {
  FieldValue,
  Timestamp,
  convertDocumentsToArray,
  convertDocToObject,
} from '../../firebase'
import {
  ADD_TUTORIAL,
  UPDATE_TUTORIAL,
  DELETE_TUTORIAL,
  UPDATE_SEARCH_QUERY,
  UPDATE_ORDER_BY,
  SET_REQUESTING,
  SET_ALL_FETCHED,
  RESET_STATE,
} from '../mutation-types'
import { QUERY_LIMIT } from '../../constants/general'
import uuidv4 from 'uuid'

const mutations = {
  [RESET_STATE](state, payload) {
    state.allFetched = false
    state.requesting = false
    state.searchQuery = ''
    state.orderBy = ['createdAt', 'desc']
    state.tutorials = []
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
  [ADD_TUTORIAL](state, payload) {
    state.tutorials = [...state.tutorials, payload]
  },
  [UPDATE_TUTORIAL](state, payload) {
    const { id = null, ...data } = payload
    const index = state.tutorials.findIndex(tutorial => tutorial.id === id)
    if (index === -1) return
    const tutorial = {
      ...state.tutorials[index],
      ...data,
    }
    state.tutorials = [
      ...state.tutorials.slice(0, index),
      tutorial,
      ...state.tutorials.slice(index + 1),
    ]
  },
  [DELETE_TUTORIAL](state, payload) {
    const { id = null } = payload
    const index = state.tutorials.findIndex(tutorial => tutorial.id === id)
    if (index === -1) return
    state.tutorials = [
      ...state.tutorials.slice(0, index),
      ...state.tutorials.slice(index + 1),
    ]
  },
}

let latestSnapshot = null
const actions = {
  listTutorials: ({ state, commit }, payload) => {
    const {
      searchQuery = null,
      userID = null,
      orderBy = ['createdAt', 'desc'],
    } = payload

    commit(SET_REQUESTING, true)

    if (searchQuery !== state.searchQuery) {
      latestSnapshot = null
      commit(UPDATE_SEARCH_QUERY, searchQuery)
      commit(SET_ALL_FETCHED, false)
    }
    if (orderBy[0] !== state.orderBy[0] || orderBy[1] !== state.orderBy[1]) {
      latestSnapshot = null
      commit(UPDATE_ORDER_BY, {
        orderBy,
      })
      commit(SET_ALL_FETCHED, false)
    }

    let snapshot = firebase
      .getDB()
      .collection('users')
      .doc(userID)
      .collection('tutorials')

    if (state.searchQuery) {
      snapshot = snapshot
        .orderBy('name')
        .startAt(searchQuery)
        .endAt(`${searchQuery}\uf8ff`)
    } else {
      snapshot = snapshot.orderBy(state.orderBy[0], state.orderBy[1])
    }

    if (latestSnapshot && latestSnapshot.docs.length > 0) {
      snapshot = snapshot.startAfter(
        latestSnapshot.docs[latestSnapshot.docs.length - 1]
      )
    }

    snapshot = snapshot.limit(QUERY_LIMIT)

    // eslint-disable-next-line no-shadow
    snapshot.onSnapshot(snapshot => {
      console.log(snapshot)
      snapshot.docChanges().forEach(change => {
        const tutorial = convertDocToObject(change.doc)
        if (change.type === 'added') {
          commit(ADD_TUTORIAL, tutorial)
        }
        if (change.type === 'modified') {
          commit(UPDATE_TUTORIAL, tutorial)
        }
        if (change.type === 'removed') {
          commit(DELETE_TUTORIAL, tutorial)
        }
      })

      commit(SET_ALL_FETCHED, snapshot.empty)
      commit(SET_REQUESTING, false)
      if (!latestSnapshot) {
        latestSnapshot = snapshot
      }
    })
  },
  addTutorial: async ({ commit }, payload) => {
    const { userID, data } = payload
    const { id, steps, ...fields } = data
    commit(SET_REQUESTING, true)
    await firebase
      .getDB()
      .collection('users')
      .doc(userID)
      .collection('tutorials')
      .add({
        ...fields,
        steps: steps.map(step => {
          if (step.id) return step
          return {
            ...step,
            id: uuidv4(),
          }
        }),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })
  },
  updateTutorial: async ({ commit, state }, payload) => {
    const { userID, data } = payload
    const { id, steps, ...fields } = data
    commit(SET_REQUESTING, true)
    await firebase
      .getDB()
      .collection('users')
      .doc(userID)
      .collection('tutorials')
      .doc(id)
      .update({
        ...fields,
        steps: steps.map(step => {
          if (step.id) return step
          return {
            ...step,
            id: uuidv4(),
          }
        }),
        updatedAt: FieldValue.serverTimestamp(),
      })
  },
  deleteTutorial: async ({ commit }, payload) => {
    const { userID, data } = payload
    const { id } = data
    commit(SET_REQUESTING, true)
    await firebase
      .getDB()
      .collection('users')
      .doc(userID)
      .collection('tutorials')
      .doc(id)
      .delete()
  },
}

const state = {
  allFetched: false,
  requesting: false,
  searchQuery: '',
  orderBy: ['createdAt', 'desc'],
  tutorials: [],
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
