import { combineReducers } from 'redux'
import { routerReducer as routing } from 'react-router-redux'

import counter from './counter'
import editor from './editor'
import variables from './variables'

function getcwd(state = [], action) {
  return "."
}

const rootReducer = combineReducers({
  currentWorkingDirectory: getcwd,
  variables,
  editor,
  counter,
  routing
})

export default rootReducer
