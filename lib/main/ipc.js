import { ipcMain } from 'electron'

ipcMain.on('run', (event, arg) => {
  console.log("ASYNC", arg)  // prints "ping"
  event.sender.send('asynchronous-reply', 'pong')
})

ipcMain.on('synchronous-message', (event, arg) => {
  console.log("SYNC", arg)  // prints "ping"
  event.returnValue = 'pong'
})
