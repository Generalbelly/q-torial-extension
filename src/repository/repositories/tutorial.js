import { FieldValue, Timestamp } from '../../firebase';
import TutorialEntity from '../../components/atoms/Entities/TutorialEntity';
import StepEntity from '../../components/atoms/Entities/StepEntity';

export default class TutorialRepository {
  /** @typedef {firebase.firestore.Firestore} db */
  db;

  /**
   * @param {firebase.firestore.Firestore} db
   */
  constructor(db) {
    this.db = db;
  }

  /**
   * @param {string} userId
   * @return {firebase.firestore.CollectionReference}
   *
   */
  getTutorialCollection(userId) {
    return this.db
      .collection('users')
      .doc(userId)
      .collection('tutorials');
  }

  /**
   * @return {firebase.firestore.WriteBatch}
   *
   */
  getBatch() {
    return this.db.batch();
  }

  async list(
    userId,
    {
      searchQuery = null,
      orderBy = ['createdAt', 'desc'],
      startAfter = null,
      source = 'default',
      limit = null,
    }
  ) {
    let query;
    if (searchQuery) {
      query = this.getTutorialCollection(userId)
        .orderBy('name')
        .startAt(searchQuery)
        .endAt(`${searchQuery}\uf8ff`);
    } else {
      query = this.getTutorialCollection(userId).orderBy(
        orderBy[0],
        orderBy[1]
      );
    }

    if (startAfter) {
      query = query.startAfter(startAfter);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const snapshot = await query.get({
      source,
    });
    return {
      tutorials: snapshot.docs.map(doc => doc.data()),
      allFetched: snapshot.empty,
      snapshot,
    };
  }

  /**
   * @param {string} userId
   * @param {string} tutorialId
   */
  async find(userId, tutorialId) {
    const query = this.getTutorialCollection(userId).doc(tutorialId);
    const snapshot = await query.get();
    return new TutorialEntity(snapshot.data());
  }

  /**
   * @param {string} userId
   * @param {import('../../components/atoms/Entities/TutorialEntity').default} tutorial
   */
  add(userId, tutorial) {
    return new Promise(async resolve => {
      const docRef = this.getTutorialCollection(userId).doc();
      await docRef.set({
        ...tutorial.toPlainObject(),
        id: docRef.id,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      const unsubscribe = docRef.onSnapshot(doc => {
        if (!doc.metadata.hasPendingWrites) {
          resolve(new TutorialEntity(doc.data()));
          unsubscribe();
        }
      });
    });
  }

  /**
   * @param {string} userId
   * @param {import('../../components/atoms/Entities/TutorialEntity').default} tutorial
   */
  update(userId, tutorial) {
    return new Promise(async resolve => {
      const docRef = this.getTutorialCollection(userId).doc(tutorial.id);
      await docRef.update({
        ...tutorial.toPlainObject(),
        createdAt: new Timestamp(
          tutorial.createdAt.seconds,
          tutorial.createdAt.nanoseconds
        ),
        updatedAt: FieldValue.serverTimestamp(),
      });
      const unsubscribe = docRef.onSnapshot(doc => {
        if (!doc.metadata.hasPendingWrites) {
          resolve(new TutorialEntity(doc.data()));
          unsubscribe();
        }
      });
    });
  }

  /**
   * @param {string} userId
   * @param {string} tutorialId
   */
  async listSteps(userId, tutorialId) {
    const snapshot = await this.getTutorialCollection(userId)
      .doc(tutorialId)
      .collection('steps')
      .orderBy('order', 'asc')
      .get();
    return snapshot.docs.map(doc => new StepEntity(doc.data()));
  }

  /**
   * @param {string} userId
   * @param {string} tutorialId
   * @param {import('../../components/atoms/Entities/StepEntity').default} step
   */
  addStep(userId, tutorialId, step) {
    return new Promise(async resolve => {
      const docRef = await this.getTutorialCollection(userId)
        .doc(tutorialId)
        .collection('steps')
        .doc();
      await docRef.set({
        ...step.toPlainObject(),
        id: docRef.id,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      const unsubscribe = docRef.onSnapshot(doc => {
        if (!doc.metadata.hasPendingWrites) {
          resolve(new StepEntity(doc.data()));
          unsubscribe();
        }
      });
    });
  }

  /**
   * @param {string} userId
   * @param {string} tutorialId
   * @param {import('../../components/atoms/Entities/StepEntity').default} step
   */
  updateStep(userId, tutorialId, step) {
    return new Promise(async resolve => {
      const docRef = await this.getTutorialCollection(userId)
        .doc(tutorialId)
        .collection('steps')
        .doc(step.id);
      await docRef.set({
        ...step.toPlainObject(),
        createdAt: new Timestamp(
          step.createdAt.seconds,
          step.createdAt.nanoseconds
        ),
        updatedAt: FieldValue.serverTimestamp(),
      });
      const unsubscribe = docRef.onSnapshot(doc => {
        if (!doc.metadata.hasPendingWrites) {
          resolve(new StepEntity(doc.data()));
          unsubscribe();
        }
      });
    });
  }

  /**
   * @param {string} userId
   * @param {string} tutorialId
   * @param {import('../../components/atoms/Entities/StepEntity').default} step
   */
  async deleteStep(userId, tutorialId, step) {
    await this.getTutorialCollection(userId)
      .doc(tutorialId)
      .collection('steps')
      .doc(step.id)
      .delete();
    return step;
  }

  /**
   * @param {string} userId
   * @param {string} tutorialId
   * @param {import('../../components/atoms/Entities/StepEntity').default[]} steps
   */
  updateSteps(userId, tutorialId, steps) {
    return new Promise(async resolve => {
      const unsubscribe = this.getTutorialCollection(userId)
        .doc(tutorialId)
        .collection('steps')
        .orderBy('order', 'asc')
        .onSnapshot(snapshot => {
          if (
            !snapshot.metadata.hasPendingWrites &&
            snapshot.docs.length === steps.length
          ) {
            resolve(snapshot.docs.map(doc => new StepEntity(doc.data())));
            unsubscribe();
          }
        });
      const batch = this.getBatch();
      steps.forEach((step, index) => {
        const orderAttachedStep = {
          ...step,
          order: index,
        };
        let docRef;
        if (step.id) {
          docRef = this.getTutorialCollection(userId)
            .doc(tutorialId)
            .collection('steps')
            .doc(step.id);
          batch.update(docRef, {
            ...orderAttachedStep,
            createdAt: new Timestamp(
              step.createdAt.seconds,
              step.createdAt.nanoseconds
            ),
            updatedAt: FieldValue.serverTimestamp(),
          });
        } else {
          docRef = this.getTutorialCollection(userId)
            .doc(tutorialId)
            .collection('steps')
            .doc();
          batch.set(docRef, {
            ...orderAttachedStep,
            id: docRef.id,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      });
      await batch.commit();
    });
  }

  /**
   * @param {string} userId
   * @param {import('../../components/atoms/Entities/TutorialEntity').default} tutorial
   */
  async delete(userId, tutorial) {
    await this.getTutorialCollection(userId)
      .doc(tutorial.id)
      .delete();
    return tutorial;
  }
}
