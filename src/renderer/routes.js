import React from 'react'
import { Route, IndexRoute } from 'react-router'

import App from './components/App'
import Window from './components/Window'

export default (
  <Route path="/" component={App}>
    <IndexRoute component={Window} />
  </Route>
)
