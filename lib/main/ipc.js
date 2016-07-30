import { ipcMain } from 'electron'

import { JupyterClient } from './kernel/client'

let client = new JupyterClient();

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
  console.log("Running code", arg)

  client.getEval(arg).then((result)=> {
    event.sender.send('code-result', result)
  })

})
