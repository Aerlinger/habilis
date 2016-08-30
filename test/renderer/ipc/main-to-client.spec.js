import { expect } from 'chai'
import { spawn } from 'child_process'
import _ from 'lodash'
import uuid from 'uuid'

var Application = require('spectron').Application

import ipc from '../../../src/renderer/ipc'

describe("Sending kernel messages from renderer to main", function() {
  this.timeout(5000)

  beforeEach(function () {
    this.app = new Application({
      path: './node_modules/.bin/electron'
    })

    return this.app.start()
  })

  it("creates a kernel instance", function(done) {
    let {on, send} = ipc(this.app.electron.ipcRenderer)

    send('createKernelInstance', []).then(function (instanceId) {
      expect(instanceId).to.eql(123)
      done()
    })
  })
})