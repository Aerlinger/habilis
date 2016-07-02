var ipcRenderer = null
var ipcMain = null
var BrowserWindow = null

export call(methodName, ...args) {
  if (!ipcRenderer) {
    ipcRenderer = require('electron').ipcRenderer
  }

  var responseChannel = getResponseChannel(methodName)

  return new Promise(function (resolve) {
    ipcRenderer.on(responseChannel, function (event, result) {
      ipcRenderer.removeAllListeners(responseChannel)
      resolve(result)
    })

    ipcRenderer.send(methodName, ...args)
  })
}

export respondTo(methodName, callback) {
  if (!ipcMain) {
    var electron = require('electron')
    ipcMain = electron.ipcMain
    BrowserWindow = electron.BrowserWindow
  }

  var responseChannel = getResponseChannel(methodName)

  ipcMain.on(methodName, function (event, ...args) {
    var browserWindow = BrowserWindow.fromWebContents(event.sender)
    var result = callback(browserWindow, ...args)
    event.sender.send(responseChannel, result)
  })
}

export getResponseChannel(methodName) {
  return 'ipc-helpers-' + methodName + '-response'
}
