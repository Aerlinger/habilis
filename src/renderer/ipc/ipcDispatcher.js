// import { ipcRenderer } from 'electron'

export default store => next => action => {
  let code = store.getState().editor.value

  // cursor_pos
  // history_length
  // completeness
  console.log(action.type)

  switch(action.type){
    case "KERNEL_EXECUTE":
      ipcRenderer.send("get-result", code)
  }

  return next(action)
}

