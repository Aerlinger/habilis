import { ipcMain } from 'electron'

import { JupyterClient } from './kernel/JupyterClient'

let client = new JupyterClient();
let proc = client.getChildProcess().process;

function enableDebugging() {
// CLIENT

  client.on("ready", function() {
    console.log("CLIENT READY")
  })

  client.on("event", function(source, data) {
    console.log("CLIENT EVENT", source, data.toString())
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
}

enableDebugging()

ipcMain.on('run', (event, arg) => {
  console.log("ASYNC", arg)  // prints "ping"
  event.sender.send('asynchronous-reply', 'pong')
})

ipcMain.on('synchronous-message', (event, arg) => {
  console.log("SYNC", arg)  // prints "ping"
  event.returnValue = arg
})

ipcMain.on('shutdown-kernel', (event, arg) => {

})

ipcMain.on('run-code', (event, arg) => {
  client.getEval(arg).then((result)=> {
    event.sender.send('code-result', result)
  })
})

ipcMain.on('run-code', (event, arg) => {
  client.getEval(arg).then((result)=> {
    event.sender.send('code-result', result)
  })
})

ipcMain.on('get-result', (event, getResult) => {
  client.getResult(code).then((result)=> {
    event.sender.send('code-result', result)
  })
})

ipcMain.on('kernel', (event, arg) => {
  console.log("KERNEL")

  event.sender.send('code-result', "KERNEL EVT RECV")
})
