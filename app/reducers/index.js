import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';

import counter from './counter';
import editor from './editor';

const rootReducer = combineReducers({
  editor,
  counter,
  routing
});

export default rootReducer;
