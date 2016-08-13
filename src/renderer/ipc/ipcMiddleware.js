import { ipcRenderer } from 'electron'

export default store => next => action => {
  console.log("IPC", action)
  ipcRenderer.send("kernel", action)

  switch(action.type){
    case "RUN_CODE":
      ipcRenderer.send("kernel", action)
  }

  return next(action)
}

ipcRenderer.on('asynchronous-reply', (event, arg) => {
  console.log(arg) // prints "pong"
})

ipcRenderer.on('code-result', (event, arg) => {
  console.log(arg) // prints code result
})

