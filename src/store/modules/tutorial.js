// import {firestoreAction} from 'vuexfire';
// import { db　} from '../firebase';
//
//
// const actions = {
//   bindTutorials: firestoreAction(async ({ state, bindFirestoreRef }, payload) => {
//     await bindFirestoreRef('tutorials', db.collection('tutorials'));
//   }),
//   unbindTutorials: firestoreAction(({ state, unbindFirestoreRef }, payload) => {
//     unbindFirestoreRef('tutorials');
//   }),
//   bindTutorial: firestoreAction(async ({ state, bindFirestoreRef }, payload) => {
//
//     await bindFirestoreRef('tutorials', db.collection('tutorials'));
//   }),
//   unbindTutorial: firestoreAction(({ state, unbindFirestoreRef }, payload) => {
//     unbindFirestoreRef('tutorials');
//   }),
// };
//
// const state = {
//   tutorials: [],
// };
//
// export default {
//   namespaced: true,
//   state,
//   // getters,
//   // mutations,
//   actions,
// };
