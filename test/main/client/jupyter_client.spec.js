import { expect } from 'chai';
import { spawn } from 'child_process';
import _ from 'lodash'

import uuid from 'uuid'

import { create, kill, getChildren } from '../../../lib/main/processes'
import { JupyterClient, createPythonScriptProcess } from '../../../lib/main/client'
import { log, asInternal } from '../../../lib/main/utils/log'

asInternal(__filename)


describe.only("Jupyter Client", function() {
  this.timeout(5000)

  let kernelProc;
  let client;

  before(() => {
    const kernel_path = "./test/fixtures/kernel/start_kernel.py"

    // const child  = createPythonScriptProcess(targetFile, options)
    kernelProc = create("python", [kernel_path])
    client = new JupyterClient(kernelProc);

    client.on("ready", function(res) {
      console.log("READY", res)
    })

    kernelProc.stderr.on('data', function(data) {
      console.error('STDERR:', data.toString())
    })

    kernelProc.stdout.on('data', function(data) {
      log("info", "STDOUT", data.toString())
      // console.log( JSON.parse(data.toString()) )
    })

    /*
    kernelProc.stdin.on('data', function(data) {
      console.log('STDIN:', data.toString())
    })
    */
  })

  after((done) => {
    client.kill().then(function({ code, signal }) {
      done()
    })
  })

  it("spawns a single child process", function() {
    expect(getChildren().length).to.eql(1)
  })

  it("performs simple eval", function(done) {
    client.getEval("113 + 6").then(function(result) {
      console.log("THE RESULT", result)

      expect(result).to.eql(119)

      done()
    })
  })
})
