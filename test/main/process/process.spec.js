import { expect } from 'chai';
import _ from 'lodash'
import uuid from 'uuid'

import { create, kill, getChildren } from '../../../lib/main/processes'
import { toPythonArgs } from '../../../lib/main/languages/python'
import { getVariables, getResult, getPythonScriptResults, execute, request, write } from '../../../lib/main/client'

describe("Kernel", function() {
  this.timeout(5000)

  let kernelProc;

  before(() => {
    const kernel_path = "./test/fixtures/kernel/start_kernel.py"

    kernelProc = create("python", [kernel_path])

    kernelProc.stderr.on('data', function(data) {
      console.error('STDERR:', data.toString())
    })

    kernelProc.stdout.on('data', function(data) {
      // console.log(data.toString())
      // console.log( JSON.parse(data.toString()) )
    })

    kernelProc.stdin.on('data', function(data) {
      console.log('STDIN:', data.toString())
    })
  })

  after((done) => {
    kill(kernelProc).then(function({ code, signal }) {
      done()
    })
  })

  it("spawns a single child process", function() {
    expect(getChildren().length).to.eql(1)
  })

  it("spawns a single child process", function(done) {
    getResult(kernelProc, "1 + 1").then(function(res) {
      console.log(res)

      done()
    })
  })

  /*

  it("Replies with kernel information", function(done) {
    kernelProc.stdout.on('data', function(data) {
      // console.log(data.toString())

      try {
        var messageObject = JSON.parse(data.toString())

        if (_.get(messageObject, 'result.msg_type') == 'execute_reply') {
          done()
        }
      } catch(err) {
        console.warn(err)
      }
    })
  })
  */

  it("executes a script", function(done) {
    getPythonScriptResults('./test/fixtures/sample.py').then(function(res) {
      expect(res).to.eql('starting sample\n')

      done()
    })
  })

  it("sends a request", function(done) {
    const code = '__get_variables(globals())',
          args = {
            allowStdin:  false,
            stopOnError: true
          };

    let req = request(kernelProc, {
      method: 'execute',
      kwargs: _.assign({ code: "1 + 1" }, toPythonArgs(args))
    }, {
      successEvent: ['stream'],
      hidden:       true
    })

    req.then(() => {
      done()
    })
  })

  xit("gets the result of an execution", function(done) {
    this.timeout(10000)

    const id     = uuid.v4().toString(),
          target = 'manager',
          method = 'interrupt_kernel';

    write(kernelProc, {
      id, target, method
    }).then(function(result) {
      console.log("RESULT")
      console.log(result)

      expect(result).to.eql("2")
      done()
    })
  })


  xit("gets the result of an execution", function(done) {
    this.timeout(10000)

    execute(kernelProc, "1 + 1").then(function(result) {
      expect(result).to.eql("2")
      done()
    })
  })

  xit("gets current variables", function(done) {
    this.timeout(10000)

    getVariables(kernelProc).then(function(result) {
      expect(result).to.eql("2")
      done()
    })
  })
})
