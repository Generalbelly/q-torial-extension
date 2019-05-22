import Entity from './Entity';

export default class TutorialStepEntity extends Entity {
  step_type = 'driver';

  trigger_target = null;

  trigger_event = 'load';

  hightlight_target = null;

  waiting_time = 0;

  config = {};

  created_at = null;

  updated_at = null;

  tutorial_id = null;

  tutorialEntity = null;

  constructor(data = {}) {
    super();
    this.fill(data);
  }
}
