import { expect } from 'chai'
import { spawn } from 'child_process'
import _ from 'lodash'

import uuid from 'uuid'

import { JupyterClient, getPythonScriptResults, clientMap } from '../../../src/main/kernel/client'
import { asInternal } from '../../../src/main/utils/log'

asInternal(__filename)
let log = console.log


describe("Killing a process triggers close event", function() {
  this.timeout(5000)

  let client
  let proc

  beforeEach((done) => {
    client  = new JupyterClient()
    proc = client.getChildProcess().process

    client.on("ready", function() {
      console.log("CLIENT READY")
      done()
    })
  })

  it("SIGTERM", function(done) {
    proc.on('close', (code, error) => {
      console.log("PROCESS 'SIGTERM':", code, error)
      expect(clientMap[proc.pid]).to.eql(undefined)
      done()
    })

    process.kill(proc.pid, 'SIGTERM')
  })

  it("SIGHUP", function(done) {
    proc.on('close', (code, error) => {
      console.log("PROCESS 'SIGHUP':", code, error)
      expect(clientMap[proc.pid]).to.eql(undefined)
      done()
    })

    process.kill(proc.pid, 'SIGHUP')
  })

  it("SIGQUIT", function(done) {
    proc.on('close', (code, error) => {
      console.log("PROCESS 'SIGQUIT':", code, error)
      expect(clientMap[proc.pid]).to.eql(undefined)
      done()
    })

    process.kill(proc.pid, 'SIGQUIT')
  })

  it("SIGINT", function(done) {
    proc.on('close', (code, error) => {
      console.log("PROCESS 'SIGINT':", code, error)
      expect(clientMap[proc.pid]).to.eql(undefined)
      done()
    })

    process.kill(proc.pid, 'SIGINT')
  })

  it("SIGKILL", function(done) {
    proc.on('close', (code, error) => {
      console.log("PROCESS 'SIGKILL':", code, error)
      expect(clientMap[proc.pid]).to.eql(undefined)
      done()
    })

    process.kill(proc.pid, 'SIGKILL')
  })

  it("SIGSEGV", function(done) {
    proc.on('close', (code, error) => {
      console.log("PROCESS 'SIGSEGV':", code, error)
      expect(clientMap[proc.pid]).to.eql(undefined)
      done()
    })

    process.kill(proc.pid, 'SIGSEGV')
  })
})

describe("IPC messaging", function() {
  this.timeout(5000)

  let client
  let proc

  before((done) => {
    client = new JupyterClient()
    proc = client.getChildProcess().process


    // CLIENT

    client.on("ready", function() {
      console.log("CLIENT READY")
      done()
    })

    client.on("event", function(source, data) {
      console.log("CLIENT EVENT", source, data)
    })

    client.on("error", function(error) {
      console.log("CLIENT ERROR", error)
    })

    client.on("status", function(execution_state) {
      console.log("CLIENT STATUS", execution_state)
    })


    // Process

    proc.on('close', (code, signal) => {
      console.log("PROC CLOSING:", code, signal)
    })

    proc.on('message', (message, sendHandle) => {
      console.log("PROC MESSAGE:", message, sendHandle)
    })

    proc.on('exit', (code, signal) => {
      console.log("PROC EXIT:", code, signal)
    })

    proc.on('disconnect', (data) => {
      console.log("PROC DISC:", data)
    })

    proc.on('error', (error) => {
      console.log("PROC ERROR:", error)
    })


    // STDOUT

    proc.stdout.on('data', (data) => {
      console.log("STDOUT 'data':", data.toString())
    })

    proc.stdout.on('close', (data) => {
      console.log("STDOUT 'close':", data)
    })

    proc.stdout.on('end', (data) => {
      console.log("STDOUT 'end':", data)
    })

    proc.stdout.on('error', (error) => {
      console.log("STDOUT 'error':", error)
    })

    proc.stdout.on('readable', (error) => {
      console.log("STDOUT 'readable':", error)
    })
    

    // STDIN

    proc.stdin.on('close', (data) => {
      console.log("STDIN 'close':", data)
    })

    proc.stdin.on('drain', (data) => {
      console.log("STDIN 'drain':", data)
    })

    proc.stdin.on('error', (error) => {
      console.log("STDIN 'error':", error)
    })

    proc.stdin.on('finish', (error) => {
      console.log("STDIN 'finish':", error)
    })

    proc.stdin.on('pipe', (src) => {
      console.log("STDIN 'pipe':", src)
    })

    proc.stdin.on('unpipe', (src) => {
      console.log("STDIN 'unpipe':", src)
    })
  })

  after((done) => {
    client.kill().then(function({ code, signal }) {
      log("KILLING PID", code, signal)
      done()
    })
  })
  
  it("Has reference to pid", function() {
    expect(clientMap[proc.pid]).to.eql(client)
  })

  it("runs a script", function(done) {
    getPythonScriptResults("./test/fixtures/sample.py").then(function(result) {
      expect(result).to.eql("starting sample\n")
      done()
    })
  })

  it("performs simple eval", function(done) {
    client.getEval("113 + 6").then(function(result) {
      expect(result).to.eql(119)

      done()
    })
  })

  xit("gets a result of a block of code", function(done) {
    client.getResult("a='b' foo='bar'").then(function(result) {
      // expect(result["status"]).to.eql("ok")

      // expect(result).to.have.keys("status", "execution_count", "user_expressions", "payload")

      done()
    })
  })

  it("execute returns an error for erroneous code", function(done) {
    client.execute("a = b foo='bar'").then(function(result) {

      console.log("BASIC EXEC", result)

      expect(result).to.have.keys('status', 'ename', 'evalue', 'traceback', 'user_expressions')
      /*
      ename: 'NameError',
        evalue: 'name \'b\' is not defined',
        traceback: [Object],
        execution_count: 1,
        user_expressions: {},
        engine_info: [Object],
        payload: [] })
        */

      done()
    })
  })

  it("performs basic execution", function(done) {
    client.execute("a = 'b'; foo='bar'; 1 + 1").then(function(result) {

      console.log("BASIC EXEC", result)

      expect(result["status"]).to.eql("ok")

      done()
    })
  })

  it("gets variables", function(done) {
    client.getVariables().then(function(result) {
      console.log("RES", result)
      expect(result).to.have.keys("function", "Series", "list", "DataFrame", "other", "dict", "ndarray")

      done()
    })
  })

  it("gets autocomplete", function(done) {
    client.getAutoComplete("pd.").then(function(result) {
      console.log("RESULT", result)
      expect(result['matches']).to.include("pd.algos")

      done()
    })
  })

  it("gets isComplete", function(done) {
    client.isComplete("1 + ").then(function(result) {
      expect(result).to.eql({ status: 'invalid' })

      done()
    })
  })

  it("gets isComplete for complete statement", function(done) {
    client.isComplete("pd.DataFrame").then(function(result) {
      expect(result).to.eql({ status: 'complete' })

      done()
    })
  })

  it("gets isComplete for complete statement", function(done) {
    client.isComplete("1 + 1 == 2").then(function(result) {
      expect(result).to.eql({ status: 'complete' })

      done()
    })
  })

  it("gets docSrings for builtin type", function(done) {
    client.getDocStrings(["sys"]).then(function(result) {
      expect(result["text"]).to.eql("[{\"text\": \"sys\", \"docstring\": \"no docstring provided\", \"dtype\": \"---\"}]\n")

      done()
    })
  })

  it("gets docStrings", function(done) {
    client.getDocStrings(["pd"]).then(function(result) {
      expect(result["text"]).to.eql("[{\"text\": \"pd\", \"docstring\": \"\\npandas - a powerful data analysis and manipulation library for Python\\n=====================================================================\\n\\nSee http://pandas.pydata.org/ for full documentation. Otherwise, see the\\ndocstrings of the various objects in the pandas namespace:\\n\\nSeries\\nDataFrame\\nPanel\\nIndex\\nDatetimeIndex\\nHDFStore\\nbdate_range\\ndate_range\\nread_csv\\nread_fwf\\nread_table\\nols\\n\", \"dtype\": \"---\"}]\n")

      done()
    })
  })
})

