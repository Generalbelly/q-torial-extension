import Vue from 'vue';
import Vuex from 'vuex';
import UserEntity from '../components/atoms/Entities/UserEntity';
import { SET_USER, SET_ACTIVE } from './mutation-types';
import modules from './modules';

Vue.use(Vuex);

const mutations = {
  [SET_USER](state, payload) {
    if (payload) {
      state.user = new UserEntity({
        ...state.user,
        ...payload,
      });
    } else {
      state.user = null;
    }
  },
  [SET_ACTIVE](state, payload) {
    state.active = payload;
  },
};

const actions = {
  setUser({ commit }, payload) {
    commit(SET_USER, payload);
  },
  setActive({ commit }, payload) {
    commit(SET_ACTIVE, payload);
  },
};

const getters = {};

const state = {
  user: null,
  active: false,
};

export default new Vuex.Store({
  state,
  mutations,
  actions,
  getters,
  modules,
  strict: process.env.NODE_ENV !== 'production',
});
