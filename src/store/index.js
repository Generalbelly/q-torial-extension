import Vue from 'vue';
import Vuex from 'vuex';
// import modules from './modules';
import { SET_USER, SET_SERVER_SIDE_ERRORS } from './mutation-types';
import UserEntity from '../components/atoms/Entities/UserEntity';

Vue.use(Vuex);

const mutations = {
  // [SET_ERROR_CODE](state, code) {
  //   state.errorCode = code;
  // },
  [SET_USER](state, userEntity) {
    if (userEntity) {
      state.userEntity = new UserEntity({
        ...state.userEntity,
        ...userEntity,
      });
    } else {
      state.userEntity = null;
    }
  },
  [SET_SERVER_SIDE_ERRORS](state, payload) {
    state.serverSideErrors = payload;
  },
};

const actions = {
  setUser({ commit }, userEntity) {
    commit(SET_USER, userEntity);
  },
  setServerSideErrors({ commit }, payload) {
    commit(SET_SERVER_SIDE_ERRORS, payload);
  },
};

const state = {
  userEntity: null,
  // errorCode: null,
  serverSideErrors: {},
};

export default new Vuex.Store({
  state,
  mutations,
  actions,
  // modules,
  // strict: process.env.NODE_ENV !== 'production',
});
