import React from 'react'
import { Route, IndexRoute } from 'react-router'

import App from './containers/App'
import Window from './components/Window'
import HomePage from './containers/HomePage'
import CounterPage from './containers/CounterPage'

export default (
  <Route path="/" component={App}>
    <IndexRoute component={Window} />
    <Route path="/home" component={HomePage} />
    <Route path="/counter" component={CounterPage} />
  </Route>
);
