import Vue from 'vue';
import Vuex from 'vuex';
import { SET_USER, RECORD_URL, CLEAR_RECORDED_URL, SET_ACTIVE, SET_PAGE_STATUS } from './mutation-types';
import UserEntity from '../components/atoms/Entities/UserEntity';

Vue.use(Vuex);

const mutations = {
  [SET_USER](state, payload) {
    if (payload) {
      state.userEntity = new UserEntity({
        ...state.userEntity,
        ...payload,
      });
    } else {
      state.userEntity = null;
    }
  },
  [RECORD_URL](state, payload) {
    state.urls = [...state.urls, payload];
  },
  [CLEAR_RECORDED_URL](state) {
    state.urls = [];
  },
  [SET_ACTIVE](state, payload) {
    state.active = payload;
  },
  [SET_PAGE_STATUS](state, payload) {
    state.pageStatus = payload;
  },
};

const actions = {
  setUser({ commit }, payload) {
    commit(SET_USER, payload);
  },
  recordUrl({ commit }, payload) {
    commit(RECORD_URL, payload);
  },
  clearRecordedUrl({ commit }) {
    commit(CLEAR_RECORDED_URL);
  },
  setActive({ commit }, payload) {
    commit(SET_ACTIVE, payload);
  },
  setPageStatus({ commit }, payload) {
    commit(SET_PAGE_STATUS, payload);
  },
};

const getters = {
  latestUrl(state) {
    return state.urls.length > 0 ? state.urls[state.urls.length - 1] : null;
  },
};

const state = {
  userEntity: null,
  serverSideErrors: {},
  urls: [],
  active: false,
  pageStatus: null,
};

export default new Vuex.Store({
  state,
  mutations,
  actions,
  getters,
  strict: process.env.NODE_ENV !== 'production',
});
