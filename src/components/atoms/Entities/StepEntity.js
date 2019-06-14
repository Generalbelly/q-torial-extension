import Entity from './Entity';

export default class StepEntity extends Entity {
  type = 'tooltip';

  triggerTarget = 'window';

  triggerEvent = 'load';

  highlightTarget = null;

  waitingTime = 0;

  config = {};

  constructor(data = {}) {
    super();
    this.fill(data);
  }
}
