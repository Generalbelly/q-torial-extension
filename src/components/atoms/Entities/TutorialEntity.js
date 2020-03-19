import Entity from './Entity';
import StepEntity from './StepEntity';
import { validateUrlPath } from './PathOperators';

export default class TutorialEntity extends Entity {
  name = null;

  description = null;

  domain = null;

  pathOperator = 'EQUALS';

  pathValue = null;

  steps = [];

  parameters = [];

  settings = {
    once: true,
  };

  buildUrl = null;

  isActive = false;

  gaId = null;

  gaPropertyId = null;

  constructor(data = {}) {
    super();
    const { steps = [], ...props } = data;
    this.fill(props);
    this.steps = steps.map(s => new StepEntity(s));
  }

  couldBeShownOn(urlPath) {
    if (!this.pathValue) return true;
    return validateUrlPath(this.pathOperator, this.pathValue, urlPath);
  }

  toPlainObject() {
    return super.toPlainObject([
      'createdAt',
      'updatedAt',
      'performances',
      'steps',
    ]);
  }
}
