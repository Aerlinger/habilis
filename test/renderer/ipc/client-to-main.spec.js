import { expect } from 'chai'
import { spawn } from 'child_process'
import electronPath from 'electron-prebuilt'
import _ from 'lodash'
import uuid from 'uuid'
import { Application } from 'spectron'

// import configureStore from '../../../src/renderer/store/configureStore'

const delay = time => new Promise(resolve => setTimeout(resolve, time))

describe("Sending kernel messages from renderer to main", function() {
  this.timeout(5000)

  before(function() {
    this.app = new Application({
      path: electronPath,
      args: ['.']
    })

    return this.app.start()
  })

  after(() => {
    if (this.app && this.app.isRunning()) {
      return this.app.stop()
    }
  })
/*
  const findButtons = function() {
    const { value } = this.app.client.elements(`#execute`)
    
    return value.map(btn => btn.ELEMENT)
  }
  */

  it("dispatches action to main", function() {
    // const store = configureStore()

    const { client } = this.app

    const btn = this.app.client.elements(`#execute`)

    expect(btn).to.eql({})

    // const buttons = findButtons()
  })
})
