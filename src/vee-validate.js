import { Validator } from 'vee-validate'
import { validateUrlPath } from './components/atoms/Entities/PathOperators'

const paramNames = ['pathOperator', 'pathValue']
Validator.extend(
  'url-path',
  (value, { pathOperator, pathValue } = {}) =>
    validateUrlPath(pathOperator, pathValue, value),
  {
    paramNames,
  }
)
