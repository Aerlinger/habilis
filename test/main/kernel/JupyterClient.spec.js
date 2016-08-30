import { expect } from 'chai'
import { spawn } from 'child_process'
import _ from 'lodash'
import uuid from 'uuid'

import { JupyterClient, getPythonScriptResults } from '../../../src/main/kernel/JupyterClient'
import { log, asInternal } from '../../../src/main/utils/log'

asInternal(__filename)

describe("Jupyter Client", function() {
  this.timeout(5000)

  let kernelProc
  let client

  before((done) => {
    client = new JupyterClient()

    client.on("ready", function(res) {
      done()
    })
  })

  after((done) => {
    client.kill().then(function({ code, signal }) {
      log("KILLING PID", code, signal)
      done()
    })
  })

  it("gets results", function(done) {
    client.getResult("5 + 5").then(function(result) {
      // expect(result).to.eql({})

      done()
    })
  })

  it("performs simple eval", (done) => {
    client.getEval("113 + 6").then(function(result) {
      expect(result).to.eql(119)

      done()
    })
  })
  
  it("can interrupt execution", (done) => {
    
  })
  
  it("gets kernel info", (done) => {
    client.getEval("113 + 6").then(function(result) {
      expect(result).to.eql(119)

      done()
    })
  })

  it("gets variables", (done) => {
    client.getVariables().then(function(results) {
      expect(results["Series"]).to.eql([])
      expect(results["list"]).to.eql([])
      expect(results["dict"]).to.eql([])
      expect(results["function"][0].toString()).to.eql({name: "a", repr: "repr"})

      expect(results).to.eql({
        "function": [],
        "Series": [],
        "list": [],
        "dict": [],
        "ndarray": [],
        "DataFrame": [],
        "other": []
      })

      done()
    })
  })

  describe("Running a script", (done) => {
    it("runs a script", (done) => {
      getPythonScriptResults("./test/fixtures/sample.py").then((result) => {
        expect(result).to.eql("starting sample\n")

        done()
      })
    })
  })

})
