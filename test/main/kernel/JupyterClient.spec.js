import { expect } from 'chai';
import { spawn } from 'child_process';
import _ from 'lodash'

import uuid from 'uuid'

// import { create, kill, getChildren } from '../../../lib/main/processes'
import { JupyterClient } from '../../../lib/main/kernel/client'
import { log, asInternal } from '../../../lib/main/utils/log'

asInternal(__filename)


describe("Jupyter Client", function() {
  this.timeout(5000)

  let kernelProc;
  let client;

  before((done) => {
    // const child  = createPythonScriptProcess(targetFile, options)
    // kernelProc = create("python", ["./test/fixtures/kernel/start_kernel.py"])
    client = new JupyterClient();
    kernelProc = client.childProcess

    client.on("ready", function(res) {
      /*
      kernelProc.stderr.on('data', function(data) {
        console.error('STDERR:', data.toString())
      })

      kernelProc.stdout.on('data', function(data) {
        // log("info", "STDOUT", data.toString())
        // console.log( JSON.parse(data.toString()) )
      })
      */

      done()
    })


    /*
    kernelProc.stdin.on('data', function(data) {
      console.log('STDIN:', data.toString())
    })
    */
  })

  after((done) => {
    client.kill().then(function({ code, signal }) {
      log("KILLING PID", code, signal)
      done()
    })
  })

  xit("spawns a single child process", function() {
    expect(getChildren().length).to.eql(1)
  })

  it("gets results", function(done) {
    client.getResult("5 + 5").then(function(result) {
      // expect(result).to.eql({})

      done()
    })
  })

  it("performs simple eval", function(done) {
    client.getEval("113 + 6").then(function(result) {
      expect(result).to.eql(119)

      done()
    })
  })

  it("gets variables", function(done) {
    client.getVariables().then(function(result) {
      // expect(result).to.eql({})

      done()
    })
  })

})
