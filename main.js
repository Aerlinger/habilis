require("source-map-support").install();
!function (e) {
 function l(t) {
  if (o[t])return o[t].exports;
  var a = o[t] = {exports: {}, id: t, loaded: !1};
  return e[t].call(a.exports, a, a.exports, l), a.loaded = !0, a.exports
 }

 var o = {};
 return l.m = e, l.c = o, l.p = "", l(0)
}([function (e, l, o) {
 "use strict";
 var t = o(1), a = void 0, n = void 0, r = null;
 t.app.on("window-all-closed", function () {
  "darwin" !== process.platform && t.app.quit()
 }), t.app.on("ready", function () {
  r = new t.BrowserWindow({
   show: !1,
   width: 1024,
   height: 728
  }), r.loadURL("file://" + __dirname + "/app/app.html"), r.webContents.on("did-finish-load", function () {
   r.show(), r.focus()
  }), r.on("closed", function () {
   r = null
  }), "darwin" === process.platform ? (n = [{
   label: "Electron",
   submenu: [{
    label: "About ElectronReact",
    selector: "orderFrontStandardAboutPanel:"
   }, {type: "separator"}, {label: "Services", submenu: []}, {type: "separator"}, {
    label: "Hide ElectronReact",
    accelerator: "Command+H",
    selector: "hide:"
   }, {label: "Hide Others", accelerator: "Command+Shift+H", selector: "hideOtherApplications:"}, {
    label: "Show All",
    selector: "unhideAllApplications:"
   }, {type: "separator"}, {
    label: "Quit", accelerator: "Command+Q", click: function () {
     t.app.quit()
    }
   }]
  }, {
   label: "Edit",
   submenu: [{label: "Undo", accelerator: "Command+Z", selector: "undo:"}, {
    label: "Redo",
    accelerator: "Shift+Command+Z",
    selector: "redo:"
   }, {type: "separator"}, {label: "Cut", accelerator: "Command+X", selector: "cut:"}, {
    label: "Copy",
    accelerator: "Command+C",
    selector: "copy:"
   }, {label: "Paste", accelerator: "Command+V", selector: "paste:"}, {
    label: "Select All",
    accelerator: "Command+A",
    selector: "selectAll:"
   }]
  }, {
   label: "View", submenu: [{
    label: "Toggle Full Screen", accelerator: "Ctrl+Command+F", click: function () {
     r.setFullScreen(!r.isFullScreen())
    }
   }]
  }, {
   label: "Window",
   submenu: [{label: "Minimize", accelerator: "Command+M", selector: "performMiniaturize:"}, {
    label: "Close",
    accelerator: "Command+W",
    selector: "performClose:"
   }, {type: "separator"}, {label: "Bring All to Front", selector: "arrangeInFront:"}]
  }, {
   label: "Help", submenu: [{
    label: "Learn More", click: function () {
     t.shell.openExternal("http://electron.atom.io")
    }
   }, {
    label: "Documentation", click: function () {
     t.shell.openExternal("https://github.com/atom/electron/tree/master/docs#readme")
    }
   }, {
    label: "Community Discussions", click: function () {
     t.shell.openExternal("https://discuss.atom.io/c/electron")
    }
   }, {
    label: "Search Issues", click: function () {
     t.shell.openExternal("https://github.com/atom/electron/issues")
    }
   }]
  }], a = t.Menu.buildFromTemplate(n), t.Menu.setApplicationMenu(a)) : (n = [{
   label: "&File",
   submenu: [{label: "&Open", accelerator: "Ctrl+O"}, {
    label: "&Close", accelerator: "Ctrl+W", click: function () {
     r.close()
    }
   }]
  }, {
   label: "&View", submenu: [{
    label: "Toggle &Full Screen", accelerator: "F11", click: function () {
     r.setFullScreen(!r.isFullScreen())
    }
   }]
  }, {
   label: "Help", submenu: [{
    label: "Learn More", click: function () {
     t.shell.openExternal("http://electron.atom.io")
    }
   }, {
    label: "Documentation", click: function () {
     t.shell.openExternal("https://github.com/atom/electron/tree/master/docs#readme")
    }
   }, {
    label: "Community Discussions", click: function () {
     t.shell.openExternal("https://discuss.atom.io/c/electron")
    }
   }, {
    label: "Search Issues", click: function () {
     t.shell.openExternal("https://github.com/atom/electron/issues")
    }
   }]
  }], a = t.Menu.buildFromTemplate(n), r.setMenu(a))
 })
}, function (e, l) {
 e.exports = require("electron")
}]);
//# sourceMappingURL=main.js.map