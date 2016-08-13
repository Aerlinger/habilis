import chai from 'chai'
import chaiImmutable from 'chai-immutable'

chai.use(chaiImmutable)

import 'babel-polyfill'
import { jsdom } from 'jsdom'

global.document = jsdom('<!doctype html><html><body></body></html>')
global.window = document.defaultView
global.navigator = global.window.navigator

window.localStorage = window.sessionStorage = {
  getItem(key) {
    return this[key]
  },
  setItem(key, value) {
    this[key] = value
  },
  removeItem(key) {
    this[key] = undefined
  },
}

// require('pretty-error').start()
