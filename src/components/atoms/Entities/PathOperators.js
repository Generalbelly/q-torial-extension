export const PATH_ALL = 'ALL'
export const PATH_EQUALS = 'EQUALS'
export const PATH_STARTS_WITH = 'STARTS_WITH'
export const PATH_ENDS_WITH = 'ENDS_WITH'
export const PATH_CONTAINS = 'CONTAINS'
// export const PATH_NOT_EQUALS = 'NOT_EQUALS'
export const PATH_REGEX = 'REGEX'

export default [
  {
    value: PATH_ALL,
    text: 'All the path names',
  },
  {
    value: PATH_EQUALS,
    text: 'Path names that are equal to',
  },
  {
    value: PATH_STARTS_WITH,
    text: 'Path names that starts with',
  },
  {
    value: PATH_ENDS_WITH,
    text: 'Path names that ends with',
  },
  {
    value: PATH_CONTAINS,
    text: 'Path names that contains',
  },
  {
    value: PATH_REGEX,
    text: 'Path names that match the following regular expression: ',
  },
  // {
  //   value: PATH_NOT_EQUALS,
  //   text: 'Path names that are not equal to',
  // },
]

export const validateTutorialPath = (pathOperator, pathValue, urlPath) => {
  if (!urlPath.startsWith('/')) return false
  const evaluators = {
    [PATH_EQUALS]: (pv, up) => pv === up,
    [PATH_STARTS_WITH]: (pv, up) => up.startsWith(pv),
    [PATH_ENDS_WITH]: (pv, up) => up.endsWith(pv),
    [PATH_CONTAINS]: (pv, up) => up.includes(pv),
    [PATH_REGEX]: (pv, up) => new RegExp(pv).test(up),
    // [PATH_NOT_EQUALS]: (pv, up) => pv !== up,
    [PATH_ALL]: (pv, up) => pv !== up,
  }
  return evaluators[pathOperator](pathValue, urlPath.slice(1))
}
