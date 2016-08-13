import { expect } from 'chai'
import React from 'react'
import {
  renderIntoDocument,
  scryRenderedDOMComponentsWithTag,
  findRenderedDOMComponentWithClass,
  Simulate
} from 'react-addons-test-utils'
import { Provider } from 'react-redux'

import configureStore from '../../../src/renderer/store/configureStore'
import FormSamples from '../../../src/renderer/components/FormSamples.jsx'


function setup(initialState) {
  const store = configureStore(initialState)

  const app = renderIntoDocument(
    <Provider store={store}>
      <FormSamples />
    </Provider>
  )

  return {
    app,
    p: findRenderedDOMComponentWithClass(app, 'email')
  }
}

describe('Form Variables', () => {
  it('finds email tag', () => {
    const { p } = setup()
    expect(p.textContent).to.match(/^Email address$/)
  })
})
