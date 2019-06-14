import Entity from './Entity';
import StepEntity from './StepEntity';
import { has } from '../../../utils';

export default class TutorialEntity extends Entity {
  name = null;

  description = null;

  domain = null;

  pathOperator = 'EQUAL';

  pathValue = null;

  parameters = [];

  settings = {};

  isActive = false;

  steps = [];

  createdAt = null;

  createdAtAsDate = null;

  updatedAt = null;

  updatedAtAsDate = null;

  constructor(data = {}) {
    super();
    const { steps = [], ...props } = data;

    this.fill(props);
    this.steps = steps.map(step => new StepEntity(step));
  }

  toPlainObject() {
    const privateProperty = ['createdAtAsDate', 'updatedAtAsDate', 'createdAt', 'updatedAt'];
    const object = {};
    Object.keys(this).forEach(propertyName => {
      if (propertyName === 'steps') {
        object[propertyName] = this[propertyName].map(step => step.toPlainObject());
      } else if (!privateProperty.includes(propertyName) && has.call(this, propertyName)) {
        object[propertyName] = this[propertyName];
      }
    });
    return object;
  }
}
