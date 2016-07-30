import { expect } from 'chai';
import { spawn } from 'child_process';
import _ from 'lodash'

import { asInternal } from '../../../lib/main/utils/log'
// let log = asInternal(__filename)
let log = console.log

import uuid from 'uuid'

// import { create, kill, getChildren } from '../../../lib/main/processes'
import { JupyterClient, getPythonScriptResults } from '../../../lib/main/kernel/client'


describe("Jupyter Kernel Process", function() {
  this.timeout(5000)

  it("runs a script", function(done) {
    getPythonScriptResults("./test/fixtures/sample.py").then(function(result) {
      done()
    })
  })

})
