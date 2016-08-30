import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import { hashHistory } from 'react-router'
import { routerMiddleware } from 'react-router-redux'
import createLogger from 'redux-logger'

import rootReducer from '../reducers'
import ipcMiddleware from '../ipc/ipcDispatcher'

const logger = createLogger({
  level: 'info',
  collapsed: true,
})

const middleware = compose(
  applyMiddleware(thunk, routerMiddleware(hashHistory), logger, ipcMiddleware),
  window.devToolsExtension ? window.devToolsExtension() : noop => noop
)

export default function configureStore(initialState) {
  const store = createStore(rootReducer, initialState, middleware)

  if (module.hot) {
    module.hot.accept('../reducers', () =>
      store.replaceReducer(require('../reducers')) // eslint-disable-line global-require
    )
  }

  return store
}
