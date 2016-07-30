import { expect } from 'chai';
import { spawn } from 'child_process';
import _ from 'lodash'

import uuid from 'uuid'

import { JupyterClient, getPythonScriptResults, clientMap } from '../../lib/main/kernel/client'
import { asInternal } from '../../lib/main/utils/log'

asInternal(__filename)
let log = console.log


describe("Killing a process triggers close event", function() {
  this.timeout(5000)

  let client
  let proc

  beforeEach((done) => {
    client  = new JupyterClient();
    proc = client.getChildProcess().process;

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

  let client;
  let proc

  before((done) => {
    client = new JupyterClient();
    proc = client.getChildProcess().process;


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

  it("gets variables", function(done) {
    client.getVariables().then(function(result) {
      // expect(result).to.eql({})

      done()
    })
  })
})

