import { app, BrowserWindow, Menu, shell } from 'electron'

import './lib/main/ipc'

let menu
let template
let mainWindow = null


if (process.env.NODE_ENV === 'development') {
  require('electron-debug')() // eslint-disable-line global-require
}

const installExtensions = async() => {
  if (process.env.NODE_ENV === 'development') {
    const installer     = require('electron-devtools-installer') // eslint-disable-line global-require
    const extensions    = [
      'REACT_DEVELOPER_TOOLS',
      'REDUX_DEVTOOLS'
    ]
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS
    for (const name of extensions) {
      try {
        await installer.default(installer[name], forceDownload)
      } catch(e) {
      } // eslint-disable-line
    }
  }
}

app.on('window-all-closed', () => {
  if (process.env.NODE_ENV === 'development' || process.platform !== 'darwin')
    app.quit()
})

app.on('ready', async() => {
  await installExtensions();

  mainWindow = new BrowserWindow({
    show:   false,
    width:  1600,
    height: 1200
  })

  mainWindow.loadURL(`file://${__dirname}/lib/renderer/app.html`)

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show()
    mainWindow.focus()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.openDevTools()
    mainWindow.webContents.on('context-menu', (e, props) => {
      const { x, y } = props

      Menu.buildFromTemplate([{
        label: 'Inspect element',
        click() {
          mainWindow.inspectElement(x, y)
        }
      }]).popup(mainWindow)
    })
  }

  if (process.platform === 'darwin') {
    var osx_menus = require("json!yaml!./static/menu/darwin.yml");

    menu = Menu.buildFromTemplate(osx_menus);
    Menu.setApplicationMenu(menu);
  } else {
    var default_menus = require("json!yaml!./static/menu/default.yml");

    menu = Menu.buildFromTemplate(default_menus);
    mainWindow.setMenu(menu);
  }
})
