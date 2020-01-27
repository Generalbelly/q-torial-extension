import Entity from './Entity';

export default class StripeCustomerEntity extends Entity {
  customerId = null;

  subscriptionId = null;

  deletedAt = null;

  constructor(data = {}) {
    super();
    this.fill(data);
  }
}
