import { expect } from 'chai';
import { spawn } from 'child_process';

import { create, kill, getChildren } from '../../../lib/main/processes'

describe.only("Kernel", function() {

  it("spawns a child process", function(done) {
    this.timeout(20000)

    const kernel_path = "./test/fixtures/kernel/start_kernel.py"

    let spawned_child = create(kernel_path)

    spawned_child.stderr.on('error', function(data) {
      console.log("STDERR RECEIVED: ", data.toString())

      expect(getChildren().length).to.eql(-1)

      kill(spawned_child).then(function({code, signal}) {
        console.log("EXIT SIGNAL: ", signal)
        console.log("EXIT CODE: ", code)

        done()
      })
    });

    spawned_child.stderr.on('data', function(data) {
      console.log("STDERR RECEIVED: ", data.toString())

      expect(getChildren().length).to.eql(-1)

      kill(spawned_child).then(function({code, signal}) {
        console.log("EXIT SIGNAL: ", signal)
        console.log("EXIT CODE: ", code)

        done()
      })
    });

    spawned_child.on('end', (data) => {
      console.log("END RECEIVED: ", data.toString())

      expect(getChildren().length).to.eql(-1)


      kill(spawned_child).then(function({code, signal}) {
        console.log("EXIT SIGNAL: ", signal)
        console.log("EXIT CODE: ", code)

        done()
      })
    });

    spawned_child.on('token', (data) => {
      console.log("ERROR RECEIVED: ", data.toString())

      expect(getChildren().length).to.eql(-1)


      kill(spawned_child).then(function({code, signal}) {
        console.log("EXIT SIGNAL: ", signal)
        console.log("EXIT CODE: ", code)

        done()
      })
    });

    spawned_child.stdout.on('error', (data) => {
      console.log("ERROR RECEIVED: ", data.toString())

      expect(getChildren().length).to.eql(-1)

      
      kill(spawned_child).then(function({code, signal}) {
        console.log("EXIT SIGNAL: ", signal)
        console.log("EXIT CODE: ", code)

        done()
      })
    });

    spawned_child.stdout.on('data', (data) => {
      console.log("DATA RECEIVED: ", data)

      expect(getChildren().length).to.eql(-1)

      kill(spawned_child).then(function({code, signal}) {
        console.log("EXIT SIGNAL: ", signal)
        console.log("EXIT CODE: ", code)

        done()
      })
    });

    spawned_child.on('connect', (data) => {
      console.log("connection RECEIVED: ", data)

      expect(getChildren().length).to.eql(-1)

      kill(spawned_child).then(function({code, signal}) {
        console.log("EXIT SIGNAL: ", signal)
        console.log("EXIT CODE: ", code)

        done()
      })
    });

    spawned_child.on('connection', (data) => {
      console.log("connection RECEIVED: ", data)

      expect(getChildren().length).to.eql(-1)

      kill(spawned_child).then(function({code, signal}) {
        console.log("EXIT SIGNAL: ", signal)
        console.log("EXIT CODE: ", code)

        done()
      })
    });

    spawned_child.on('disconnect', (data) => {
      console.log("DISC RECEIVED: ", data)

      expect(getChildren().length).to.eql(-1)

      kill(spawned_child).then(function({code, signal}) {
        console.log("EXIT SIGNAL: ", signal)
        console.log("EXIT CODE: ", code)

        done()
      })
    });

    spawned_child.on('message', (data) => {
      console.log("MESSAGE RECEIVED: ", data)

      expect(getChildren().length).to.eql(-1)

      kill(spawned_child).then(function({code, signal}) {
        console.log("EXIT SIGNAL: ", signal)
        console.log("EXIT CODE: ", code)

        done()
      })
    });

    spawned_child.on('data', (data) => {
      console.log("DATA RECEIVED: ", data)

      expect(getChildren().length).to.eql(-1)

      kill(spawned_child).then(function({code, signal}) {
        console.log("EXIT SIGNAL: ", signal)
        console.log("EXIT CODE: ", code)

        done()
      })
    });

    spawned_child.on('error', function(data) {
      console.log("STDERR RECEIVED: ", data.toString())

      expect(getChildren().length).to.eql(-1)

      kill(spawned_child).then(function({code, signal}) {
        console.log("EXIT SIGNAL: ", signal)
        console.log("EXIT CODE: ", code)

        done()
      })
    });
    
    spawned_child.on('close', (data) => {
      console.log("CLOSE EVENT RECEIVED: ", data)

      expect(getChildren().length).to.eql(-1)

      kill(spawned_child).then(function({code, signal}) {
        console.log("EXIT SIGNAL: ", signal)
        console.log("EXIT CODE: ", code)

        done()
      })
    });

    
  });

})
