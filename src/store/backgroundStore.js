import Vue from 'vue';
import Vuex from 'vuex';
import UserEntity from '../components/atoms/Entities/UserEntity';
import { appFirebaseService, getUserFirebaseService } from '../firebase';
import { QUERY_LIMIT } from '../constants/general';
import {
  RESET_STATE,
  SELECT_TUTORIAL,
  SET_ACTIVE,
  SET_ALL_FETCHED,
  SET_REQUESTING,
  UPDATE_USER,
  UPDATE_ORDER_BY,
  UPDATE_SEARCH_QUERY,
  ADD_TUTORIAL,
  UPDATE_TUTORIAL,
  DELETE_TUTORIAL,
  SET_PREVIEWING,
  SET_NAVIGATING,
  SET_PENDING_STEP_INDEX,
  TUTORIAL_REPOSITORY_READY,
  SET_TASK_ID,
} from './mutation-types';

import repositoryFactory from '../repository';
import TutorialEntity from '../components/atoms/Entities/TutorialEntity';
import StepEntity from '../components/atoms/Entities/StepEntity';

Vue.use(Vuex);

const createUserRepository = () => {
  let repo = null;
  return () => {
    if (!repo) {
      repo = repositoryFactory.get('user')(appFirebaseService.getDB());
    }
    return repo;
  };
};
const getUserRepository = createUserRepository();

let tutorialRepository;

/**
 * @param {import('../components/atoms/Entities/FirebaseConfigEntity').default} firebaseConfig
 */
const initTutorialRepository = firebaseConfig => {
  if (tutorialRepository) {
    return;
  }
  const firebaseService = getUserFirebaseService(firebaseConfig, 'user');
  tutorialRepository = repositoryFactory.get('tutorial')(
    firebaseService.getDB()
  );
};

const mutations = {
  [ADD_TUTORIAL](state, payload) {
    state.tutorials = [...state.tutorials, payload];
  },
  [UPDATE_TUTORIAL](state, payload) {
    const index = state.tutorials.findIndex(
      tutorial => tutorial.id === payload.id
    );
    state.tutorials = [
      ...state.tutorials.slice(0, index),
      new TutorialEntity({
        ...state.tutorials[index],
        ...payload,
      }),
      ...state.tutorials.slice(index + 1),
    ];
  },
  [DELETE_TUTORIAL](state, payload) {
    const index = state.tutorials.findIndex(
      tutorial => tutorial.id === payload.id
    );
    state.tutorials = [
      ...state.tutorials.slice(0, index),
      ...state.tutorials.slice(index + 1),
    ];
  },
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
  [SET_ACTIVE](state, payload) {
    state.active = payload;
  },
  [RESET_STATE](state) {
    state.tutorials = [];
    state.steps = [];
    state.allFetched = false;
    state.requesting = false;
    state.searchQuery = '';
    state.orderBy = ['createdAt', 'desc'];
    state.selectedTutorialId = null;
    state.serverSideErrors = {};
    state.active = false;
    state.navigating = false;
    state.previewing = false;
    state.pendingStepIndex = -1;
  },
  [SET_ALL_FETCHED](state, payload) {
    state.allFetched = payload;
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
  [UPDATE_SEARCH_QUERY](state, payload) {
    state.searchQuery = payload;
    state.tutorials = [];
  },
  [UPDATE_ORDER_BY](state, payload) {
    state.orderBy = payload;
    state.tutorials = [];
  },
  [SELECT_TUTORIAL](state, payload) {
    state.selectedTutorialId = payload;
  },
  [TUTORIAL_REPOSITORY_READY](state, payload) {
    state.tutorialRepositoryReady = payload;
  },
  [SET_TASK_ID](state, payload) {
    state.taskId = payload;
  },
};

let tutorialsLatestSnapshot = null;
const actions = {
  setTaskId({ commit }, payload) {
    commit(SET_TASK_ID, payload);
  },
  updateLocalUser({ commit }, payload) {
    commit(UPDATE_USER, payload);
  },
  async getUser({ dispatch, state }) {
    const { setupComplete } = await getUserRepository().get(state.user.uid);
    await dispatch('updateLocalUser', { setupComplete });
  },
  setActive({ commit }, payload) {
    commit(SET_ACTIVE, payload);
  },
  selectTutorial: async ({ commit, state, getters, dispatch }, { id }) => {
    commit(SET_REQUESTING, true);
    commit(SELECT_TUTORIAL, id);
    if (state.selectedTutorialId) {
      if (!getters.tutorial && state.tutorialRepositoryReady) {
        let done;
        while (!done) {
          // eslint-disable-next-line no-await-in-loop
          await dispatch('listTutorials');
          if (getters.tutorial || state.allFetched) {
            done = true;
          }
        }
      }
      // 選択されてるTutorialがあるのにみつからなかった場合
      if (state.selectedTutorialId && !getters.tutorial) {
        commit(SELECT_TUTORIAL, null);
      } else {
        const steps = await tutorialRepository.listSteps(
          getters.firebaseConfig.uid,
          state.selectedTutorialId
        );
        commit(UPDATE_TUTORIAL, {
          ...getters.tutorial,
          steps,
        });
      }
    }
    commit(SET_REQUESTING, false);
  },
  async listTutorials({ state, commit, getters }, payload = {}) {
    const {
      searchQuery = null,
      orderBy = ['createdAt', 'desc'],
      source = 'default',
    } = payload;
    commit(SET_REQUESTING, true);
    if (searchQuery !== state.searchQuery) {
      tutorialsLatestSnapshot = null;
      commit(UPDATE_SEARCH_QUERY, searchQuery);
      commit(SET_ALL_FETCHED, false);
    }
    if (orderBy[0] !== state.orderBy[0] || orderBy[1] !== state.orderBy[1]) {
      tutorialsLatestSnapshot = null;
      commit(UPDATE_ORDER_BY, orderBy);
      commit(SET_ALL_FETCHED, false);
    }

    const {
      tutorials,
      allFetched = false,
      snapshot,
    } = await tutorialRepository.list(
      getters.firebaseConfig.uid,
      state.user.uid,
      {
        searchQuery,
        orderBy,
        source,
        startAfter:
          tutorialsLatestSnapshot &&
          tutorialsLatestSnapshot.docs &&
          tutorialsLatestSnapshot.docs.length > 0
            ? tutorialsLatestSnapshot.docs[
                tutorialsLatestSnapshot.docs.length - 1
              ]
            : null,
        limit: QUERY_LIMIT,
      }
    );

    tutorials.forEach(tutorial => {
      commit(ADD_TUTORIAL, tutorial);
    });
    commit(SET_ALL_FETCHED, allFetched);
    commit(SET_REQUESTING, false);
    if (!tutorialsLatestSnapshot) {
      tutorialsLatestSnapshot = snapshot;
    }
  },
  async getTutorial({ commit, getters }, payload) {
    commit(SET_REQUESTING, true);
    const { firebaseConfig } = getters;
    const tutorial = await tutorialRepository.find(firebaseConfig.uid, payload);
    commit(ADD_TUTORIAL, tutorial);
    commit(SET_REQUESTING, false);
  },
  async addTutorial({ commit, getters }, payload) {
    commit(SET_REQUESTING, true);
    const { firebaseConfig } = getters;
    const tutorial = await tutorialRepository.add(
      firebaseConfig.uid,
      new TutorialEntity(payload)
    );
    commit(ADD_TUTORIAL, tutorial);
    commit(SELECT_TUTORIAL, tutorial.id);

    const step = await tutorialRepository.addStep(
      firebaseConfig.uid,
      tutorial.id,
      new StepEntity(payload.steps[0])
    );
    commit(UPDATE_TUTORIAL, {
      ...tutorial,
      steps: [...getters.tutorial.steps, step],
    });
    commit(SET_REQUESTING, false);
  },
  async updateTutorial({ commit, getters }, payload) {
    commit(SET_REQUESTING, true);
    const tutorial = await tutorialRepository.update(
      getters.firebaseConfig.uid,
      new TutorialEntity(payload)
    );
    commit(UPDATE_TUTORIAL, tutorial);
    commit(SET_REQUESTING, false);
  },
  async addStep({ commit, getters }, payload) {
    commit(SET_REQUESTING, true);
    const { tutorial, firebaseConfig } = getters;
    const step = await tutorialRepository.addStep(
      firebaseConfig.uid,
      tutorial.id,
      new StepEntity(payload)
    );
    commit(UPDATE_TUTORIAL, {
      ...tutorial,
      steps: [...getters.tutorial.steps, step],
    });
    commit(SET_REQUESTING, false);
  },
  async updateStep({ commit, getters }, payload) {
    commit(SET_REQUESTING, true);
    const { tutorial, firebaseConfig } = getters;
    const step = await tutorialRepository.updateStep(
      firebaseConfig.uid,
      tutorial.id,
      new StepEntity(payload)
    );
    const index = tutorial.steps.findIndex(s => s.id === step.id);
    commit(UPDATE_TUTORIAL, {
      ...getters.tutorial,
      steps: [
        ...getters.tutorial.steps.slice(0, index),
        step,
        ...getters.tutorial.steps.slice(index + 1),
      ],
    });
    commit(SET_REQUESTING, false);
  },
  async deleteStep({ commit, getters }, payload) {
    commit(SET_REQUESTING, true);
    const { tutorial, firebaseConfig } = getters;
    const step = await tutorialRepository.deleteStep(
      firebaseConfig.uid,
      tutorial.id,
      new StepEntity(payload)
    );
    const index = tutorial.steps.findIndex(s => s.id === step.id);
    commit(UPDATE_TUTORIAL, {
      ...getters.tutorial,
      steps: [
        ...getters.tutorial.steps.slice(0, index),
        ...getters.tutorial.steps.slice(index + 1),
      ],
    });
    commit(SET_REQUESTING, false);
  },
  async updateSteps({ commit, getters }, payload) {
    commit(SET_REQUESTING, true);
    const { tutorial, firebaseConfig } = getters;
    const steps = await tutorialRepository.updateSteps(
      firebaseConfig.uid,
      tutorial.id,
      payload.steps.map(step => new StepEntity(step))
    );
    commit(UPDATE_TUTORIAL, {
      ...tutorial,
      steps,
    });
    commit(SET_REQUESTING, false);
  },
  async deleteTutorial({ commit, getters }, payload) {
    commit(SET_REQUESTING, true);
    const { firebaseConfig } = getters;
    const tutorial = await tutorialRepository.delete(
      firebaseConfig.uid,
      new TutorialEntity(payload)
    );
    commit(DELETE_TUTORIAL, tutorial);
    commit(SET_REQUESTING, false);
  },
  async checkUserPaymentInfo({ commit, state }) {
    const stripeCustomer = await getUserRepository().getUserPaymentInfo(
      state.user.uid
    );
    if (stripeCustomer) {
      commit(UPDATE_USER, { stripeCustomer });
    }
  },
  async getFirebaseConfig({ dispatch, state }) {
    const firebaseConfig = await getUserRepository().getFirebaseConfig(
      state.user.uid
    );
    if (firebaseConfig) {
      await dispatch('updateLocalUser', { firebaseConfig });
      await dispatch('initTutorialRepository');
    }
  },
  initTutorialRepository({ commit, getters }) {
    initTutorialRepository(getters.firebaseConfig);
    commit(TUTORIAL_REPOSITORY_READY, true);
  },
  setNavigating({ commit }, value) {
    commit(SET_NAVIGATING, value);
  },
  setPreviewing({ commit }, value) {
    commit(SET_PREVIEWING, value);
  },
  setPendingStepIndex({ commit }, value) {
    commit(SET_PENDING_STEP_INDEX, value);
  },
  resetState({ commit }, value) {
    commit(RESET_STATE, value);
  },
  async signIn({ dispatch }, { email, password }) {
    const { user } = await appFirebaseService.signIn(email, password);
    await dispatch('updateLocalUser', user);
    await dispatch('getUser');
  },
  async signOut({ state, dispatch }) {
    await appFirebaseService.signOut();
    await getUserFirebaseService(state.user.firebaseConfig).signOut();
    await dispatch('updateLocalUser', null);
  },
  async firebaseSignIn({ state }, { email, password }) {
    await getUserFirebaseService(state.user.firebaseConfig).signIn(
      email,
      password
    );
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
  selectedTutorialId: null,
  serverSideErrors: {},
  navigating: false,
  previewing: false,
  pendingStepIndex: -1,
  tutorialRepositoryReady: false,
  taskId: null,
};

const getters = {
  // eslint-disable-next-line no-shadow
  tutorial(state) {
    const tutorial = state.tutorials.find(
      t => t.id === state.selectedTutorialId
    );
    return tutorial || null;
  },
  firebaseConfig(state) {
    return state.user ? state.user.firebaseConfig : null;
  },
};

export default new Vuex.Store({
  state,
  mutations,
  actions,
  getters,
  // strict: process.env.NODE_ENV !== 'production',
});
