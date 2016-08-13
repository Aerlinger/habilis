import { combineReducers } from 'redux'
import { routerReducer as routing } from 'react-router-redux'

import editor from './editor'
import variables from './variables'

function currentWorkingDirectory(state = [], action) {
  return "."
}

export default combineReducers({
  currentWorkingDirectory,
  variables,
  editor,
  routing
})