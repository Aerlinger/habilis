import { ipcMain } from 'electron'
import { JupyterClient } from './kernel/JupyterClient'

let client = new JupyterClient()
let proc = client.getChildProcess().process

ipcMain.on('shutdown-kernel', (event, arg) => {

})

ipcMain.on('run-code', (event, arg) => {
  client.getEval(arg).then((result)=> {
    event.sender.send('code-result', result)
  })
})

ipcMain.on('get-result', (event, code) => {
  client.getResult(code).then((result)=> {
    event.sender.send('code-result', result)
  })
})
