import Vue from 'vue';
import Vuex from 'vuex';
import {
  UPDATE_USER,
  SET_SERVER_SIDE_ERRORS,
  SYNC_DATA,
  SORT_TUTORIALS,
  SET_REQUESTING,
  SET_NAVIGATING,
  SET_PREVIEWING,
  SET_PENDING_STEP_INDEX,
} from './mutation-types';
import UserEntity from '../components/atoms/Entities/UserEntity';
import { sendCommand } from '../api';
import { PASS_DATA_TO_BACKGROUND } from '../constants/command-types';
import TutorialEntity from '../components/atoms/Entities/TutorialEntity';
import { has } from '../utils';

Vue.use(Vuex);

const mutations = {
  [UPDATE_USER](state, payload) {
    if (payload) {
      state.user = new UserEntity({
        ...state.user,
        ...payload,
      });
    } else {
      state.user = null;
    }
  },
  [SET_SERVER_SIDE_ERRORS](state, payload) {
    state.serverSideErrors = payload;
  },
  [SYNC_DATA](state, payload) {
    Object.keys(payload).forEach(key => {
      if (has.call(state, key)) {
        if (key === 'tutorials' && payload.tutorials.length > 0) {
          state.tutorials = payload.tutorials.map(
            tutorial => new TutorialEntity(tutorial)
          );
        } else if (key === 'tutorial' && payload.tutorial) {
          state.tutorial = new TutorialEntity(payload.tutorial);
        } else {
          state[key] = payload[key];
        }
      }
    });
  },
  [SORT_TUTORIALS](state, payload) {
    const [field, direction] = payload;
    state.tutorials = [...state.tutorials].sort((a, b) => {
      if (a[field] === b[field]) return 0;
      if (direction === 'desc') {
        return a[field] < b[field] ? 1 : -1;
      }
      return a[field] > b[field] ? 1 : -1;
    });
  },
  [SET_REQUESTING](state, payload) {
    state.requesting = payload;
  },
  [SET_PREVIEWING](state, payload) {
    state.previewing = payload;
  },
  [SET_NAVIGATING](state, payload) {
    state.navigating = payload;
  },
  [SET_PENDING_STEP_INDEX](state, payload) {
    state.pendingStepIndex = payload;
  },
};

const actions = {
  updateLocalUser({ commit }, payload) {
    commit(UPDATE_USER, payload);
  },
  sortTutorials({ commit }, payload) {
    commit(SORT_TUTORIALS, payload);
  },
  selectTutorial({ commit }, payload) {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await sendCommand(PASS_DATA_TO_BACKGROUND, {
          action: 'selectTutorial',
          payload,
        });
        commit(SYNC_DATA, data);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  },
  async listTutorials({ commit, state }, payload) {
    console.log('listTutorials');
    console.log(state);
    if (state.user) {
      commit(SET_REQUESTING, true);
      const data = await sendCommand(PASS_DATA_TO_BACKGROUND, {
        action: 'listTutorials',
        payload: {
          searchQuery: state.searchQuery,
          orderBy: state.orderBy,
          ...payload,
        },
      });
      commit(SYNC_DATA, data);
      commit(SET_REQUESTING, false);
    }
  },
  async addTutorial({ commit, state, dispatch }, payload) {
    if (state.user) {
      commit(SET_REQUESTING, true);
      const data = await sendCommand(PASS_DATA_TO_BACKGROUND, {
        action: `addTutorial`,
        payload,
      });
      commit(SYNC_DATA, data);
      commit(SET_REQUESTING, false);
    }
  },
  async updateTutorial({ commit, state }, payload) {
    if (state.user) {
      commit(SET_REQUESTING, true);
      const data = await sendCommand(PASS_DATA_TO_BACKGROUND, {
        action: `updateTutorial`,
        payload,
      });
      commit(SYNC_DATA, data);
      commit(SET_REQUESTING, false);
    }
  },
  async deleteTutorial({ commit, state }, payload) {
    if (state.user) {
      commit(SET_REQUESTING, true);
      const data = await sendCommand(PASS_DATA_TO_BACKGROUND, {
        action: `deleteTutorial`,
        payload,
      });
      commit(SYNC_DATA, data);
      commit(SET_REQUESTING, false);
    }
  },
  // upsertStep: async ({ commit, state }, payload) => {
  //   if (state.user) {
  //     commit(SET_REQUESTING, true)
  //     const data = await sendCommand(PASS_DATA_TO_BACKGROUND, {
  //       action: `${payload.id ? 'update' : 'add'}Step`,
  //       payload: {
  //         data: payload,
  //       },
  //     })
  //     commit(SYNC_DATA, data)
  //     commit(SET_REQUESTING, false)
  //   }
  // },
  async addStep({ commit, state }, payload) {
    if (state.user) {
      commit(SET_REQUESTING, true);
      const data = await sendCommand(PASS_DATA_TO_BACKGROUND, {
        action: 'updateSteps',
        payload,
      });
      commit(SYNC_DATA, data);
      commit(SET_REQUESTING, false);
    }
  },
  async updateStep({ commit, state }, payload) {
    if (state.user) {
      commit(SET_REQUESTING, true);
      const data = await sendCommand(PASS_DATA_TO_BACKGROUND, {
        action: 'updateStep',
        payload,
      });
      commit(SYNC_DATA, data);
      commit(SET_REQUESTING, false);
    }
  },
  deleteStep: async ({ commit, state }, payload) => {
    if (state.user) {
      commit(SET_REQUESTING, true);
      const data = await sendCommand(PASS_DATA_TO_BACKGROUND, {
        action: 'deleteStep',
        payload,
      });
      commit(SYNC_DATA, data);
      commit(SET_REQUESTING, false);
    }
  },
  async setNavigating({ commit }, value) {
    await sendCommand(PASS_DATA_TO_BACKGROUND, {
      action: 'setNavigating',
      payload: value,
    });
    commit(SET_NAVIGATING, value);
  },
  async setPreviewing({ commit }, value) {
    await sendCommand(PASS_DATA_TO_BACKGROUND, {
      action: 'setPreviewing',
      payload: value,
    });
    commit(SET_PREVIEWING, value);
  },
  async setPendingStepIndex({ commit }, value) {
    await sendCommand(PASS_DATA_TO_BACKGROUND, {
      action: 'setPendingStepIndex',
      payload: value,
    });
    commit(SET_PENDING_STEP_INDEX, value);
  },
  async syncData({ commit }) {
    commit(SET_REQUESTING, true);
    const data = await sendCommand(SYNC_DATA);
    commit(SYNC_DATA, data);
    commit(SET_REQUESTING, false);
  },
};

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
  navigating: false,
  previewing: false,
  pendingStepIndex: -1,
};

export default new Vuex.Store({
  state,
  mutations,
  actions,
  // strict: process.env.NODE_ENV !== 'production',
});
