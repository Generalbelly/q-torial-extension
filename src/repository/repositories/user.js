import { FieldValue } from '../../firebase';
import FirebaseConfigEntity from '../../components/atoms/Entities/FirebaseConfigEntity';
import UserEntity from '../../components/atoms/Entities/UserEntity';
import StripeCustomerEntity from '../../components/atoms/Entities/StripeCustomerEntity';

export default class UserRepository {
  /** @typedef {firebase.firestore.Firestore} db */
  db;

  /** @param {firebase.firestore.Firestore} db */
  constructor(db) {
    this.db = db;
  }

  /**
   * @return {firebase.firestore.CollectionReference}
   *
   */
  getUserCollection() {
    return this.db.collection('users');
  }

  /**
   * @return {firebase.firestore.CollectionReference}
   *
   */
  getStripeCustomerCollection(userId) {
    return this.db
      .collection('users')
      .doc(userId)
      .collection('stripe_customers');
  }

  /**
   * @return {firebase.firestore.CollectionReference}
   *
   */
  getFirebaseConfigCollection(userId) {
    return this.db
      .collection('users')
      .doc(userId)
      .collection('firebase_configs');
  }

  async find(userId) {
    await this.getUserCollection()
      .doc(userId)
      .get();
  }

  /** @param {string} userId */
  async get(userId) {
    const doc = await this.getUserCollection()
      .doc(userId)
      .get();
    return new UserEntity(doc.data());
  }

  /** @param {import('../../components/atoms/Entities/UserEntity').default} user */
  async add(user) {
    return new Promise(async resolve => {
      const docRef = this.getUserCollection().doc(user.uid);
      await docRef.set({
        ...user.toPlainObject(),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      const unsubscribe = docRef.onSnapshot(doc => {
        if (!doc.metadata.hasPendingWrites) {
          resolve(new UserEntity(doc.data()));
          unsubscribe();
        }
      });
    });
  }

  /** @param {import('../../components/atoms/Entities/UserEntity').default} user */
  async update(user) {
    return new Promise(async resolve => {
      const docRef = this.getUserCollection().doc(user.uid);
      await docRef.update({
        ...user.toPlainObject(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      const unsubscribe = docRef.onSnapshot(doc => {
        if (!doc.metadata.hasPendingWrites) {
          resolve(new UserEntity(doc.data()));
          unsubscribe();
        }
      });
    });
  }

  checkUserPaymentInfo(userId, handler) {
    return this.getStripeCustomerCollection(userId)
      .where('deletedAt', '==', null)
      .limit(1)
      .onSnapshot(snapshot => {
        let stripeCustomer = null;
        if (snapshot.docs.length > 0) {
          stripeCustomer = snapshot.docs.map(
            doc => new StripeCustomerEntity(doc.data())
          )[0];
        }
        handler(stripeCustomer);
      });
  }

  checkFirebaseConfig(userId, handler) {
    return this.getFirebaseConfigCollection(userId)
      .limit(1)
      .onSnapshot(snapshot => {
        let firebaseConfig = null;
        if (snapshot.docs.length > 0) {
          firebaseConfig = snapshot.docs.map(
            doc => new FirebaseConfigEntity(doc.data())
          )[0];
        }
        handler(firebaseConfig);
      });
  }

  /**
   * @param {import('../../components/atoms/Entities/FirebaseConfigEntity').default} firebaseConfig
   */
  async upsertFirebaseConfig(userId, firebaseConfig) {
    return new Promise(async resolve => {
      /** @typedef {firebase.firestore.DocumentReference} docRef */
      let docRef;
      if (firebaseConfig.id) {
        docRef = this.getFirebaseConfigCollection(userId).doc(
          firebaseConfig.id
        );
        await this.getFirebaseConfigCollection(userId)
          .doc(firebaseConfig.id)
          .update({
            ...firebaseConfig.toPlainObject(),
            updatedAt: FieldValue.serverTimestamp(),
          });
      } else {
        docRef = this.getFirebaseConfigCollection(userId).doc();
        await docRef.set({
          ...firebaseConfig.toPlainObject(),
          id: docRef.id,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
      const unsubscribe = docRef.onSnapshot(doc => {
        if (!doc.metadata.hasPendingWrites) {
          resolve(new FirebaseConfigEntity(doc.data()));
          unsubscribe();
        }
      });
    });
  }
}
