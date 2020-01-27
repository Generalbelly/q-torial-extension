import UserRepository from './repositories/user';
import TutorialRepository from './repositories/tutorial';

const repositories = {
  user: UserRepository,
  tutorial: TutorialRepository,
};

export default {
  get(name) {
    return (...params) => new repositories[name](...params);
  },
};
