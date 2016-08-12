import { combineReducers } from 'redux'
import { routerReducer as routing } from 'react-router-redux'

import editor from './editor'
import variables from './variables'

function getcwd(state = [], action) {
  return "."
}

export default combineReducers({
  currentWorkingDirectory: getcwd,
  variables,
  editor,
  routing
})
