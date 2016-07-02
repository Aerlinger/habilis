let slice = [].slice

let ref           = require('electron')
let BrowserWindow = ref.BrowserWindow
let app           = ref.app
let dialog        = ref.dialog;

let path         = require('path');
let fs           = require('fs');
let url          = require('url');
let EventEmitter = require('events').EventEmitter;

export default class AtomWindow extends EventEmitter {

  static get iconPath() {
    return path.resolve(__dirname, '..', '..', 'resources', 'atom.png');
  }

  static get includeShellLoadTime() {
    return true
  }

  constructor(fileRecoveryService, settings) {
    super()

    this.browserWindow = null;
    this.loaded        = null;
    this.isSpec        = null;

    var hasPathToOpen, initialPaths, loadSettings, locationsToOpen, options, pathToOpen;

    this.fileRecoveryService = fileRecoveryService;

    if (settings == null) {
      settings = {};
    }

    this.resourcePath = '../../'
    initialPaths      = '.'
    pathToOpen        = null
    locationsToOpen   = null
    this.isSpec       = false
    this.headless     = false
    this.safeMode     = false
    this.devMode      = false

    if (pathToOpen) {
      if (locationsToOpen == null) {
        locationsToOpen = [
          {
            pathToOpen: pathToOpen
          }
        ];
      }
    }

    if (locationsToOpen == null) {
      locationsToOpen = [];
    }

    options = {
      show:            false,
      title:           'Atom',
      backgroundColor: "#fff",
      webPreferences:  {
        backgroundThrottling: !this.isSpec
      }
    };

    if (process.platform === 'linux') {
      options.icon = this.constructor.iconPath;
    }

    this.browserWindow = new BrowserWindow(options);
    global.atomApplication.addWindow(this);

    this.handleEvents();

    loadSettings              = Object.assign({}, settings);
    loadSettings.appVersion   = app.getVersion();
    loadSettings.resourcePath = this.resourcePath;

    if (loadSettings.devMode == null) {
      loadSettings.devMode = false;
    }

    if (loadSettings.safeMode == null) {
      loadSettings.safeMode = false;
    }

    loadSettings.atomHome = process.env.ATOM_HOME;

    if (loadSettings.clearWindowState == null) {
      loadSettings.clearWindowState = false;
    }

    if (loadSettings.initialPaths == null) {
      loadSettings.initialPaths = (function() {
        var base, i, len, results;
        results = [];
        for (i = 0, len = locationsToOpen.length; i < len; i++) {
          pathToOpen = locationsToOpen[i].pathToOpen;
          if (pathToOpen) {
            if (typeof (base = fs.statSyncNoException(pathToOpen)).isFile === "function" ? base.isFile() : void 0) {
              results.push(path.dirname(pathToOpen));
            } else {
              results.push(pathToOpen);
            }
          }
        }
        return results;
      })();
    }
    loadSettings.initialPaths.sort();
    if (this.constructor.includeShellLoadTime && !this.isSpec) {
      this.constructor.includeShellLoadTime = false;
      if (loadSettings.shellLoadTime == null) {
        loadSettings.shellLoadTime = Date.now() - global.shellStartTime;
      }
    }
    this.browserWindow.loadSettings = loadSettings;
    this.browserWindow.once('window:loaded', (function(_this) {
      return function() {
        _this.emit('window:loaded');
        return _this.loaded = true;
      };
    })(this));

    this.setLoadSettings(loadSettings);
    if (loadSettings.env != null) {
      this.env = loadSettings.env;
    }
    if (this.isSpec) {
      this.browserWindow.focusOnWebView();
    }
    if (typeof windowDimensions !== "undefined" && windowDimensions !== null) {
      this.browserWindow.temporaryState = {
        windowDimensions: windowDimensions
      };
    }
    hasPathToOpen = !(locationsToOpen.length === 1 && (locationsToOpen[0].pathToOpen == null));
    if (hasPathToOpen && !this.isSpecWindow()) {
      this.openLocations(locationsToOpen);
    }
  }

  setLoadSettings(loadSettings) {
    return this.browserWindow.loadURL(
      url.format({
                   protocol: 'file',
                   pathname: this.resourcePath + "/static/index.html",
                   slashes:  true,
                   hash:     encodeURIComponent(JSON.stringify(loadSettings))
                 }));
  };

  getLoadSettings() {
    var hash;
    if ((this.browserWindow.webContents != null) && !this.browserWindow.webContents.isLoading()) {
      hash = url.parse(this.browserWindow.webContents.getURL()).hash.substr(1);
      return JSON.parse(decodeURIComponent(hash));
    }
  };

  hasProjectPath() {
    var ref1;
    return ((ref1 = this.getLoadSettings().initialPaths) != null ? ref1.length : void 0) > 0;
  };

  /*
   setupContextMenu() {
   var ContextMenu;
   ContextMenu = require('./context-menu');
   return this.browserWindow.on('context-menu', (function(_this) {
   return function(menuTemplate) {
   return new ContextMenu(menuTemplate, _this);
   };
   })(this));
   };
   */

  containsPaths(paths) {
    var i, len, pathToCheck;
    for (i = 0, len = paths.length; i < len; i++) {
      pathToCheck = paths[i];
      if (!this.containsPath(pathToCheck)) {
        return false;
      }
    }
    return true;
  };

  containsPath(pathToCheck) {
    var ref1, ref2;
    return (ref1 = this.getLoadSettings()) != null ? (ref2 = ref1.initialPaths) != null ? ref2.some(function(projectPath) {
      var base;
      if (!projectPath) {
        return false;
      } else if (!pathToCheck) {
        return false;
      } else if (pathToCheck === projectPath) {
        return true;
      } else if (typeof (base = fs.statSyncNoException(pathToCheck)).isDirectory === "function" ? base.isDirectory() : void 0) {
        return false;
      } else if (pathToCheck.indexOf(path.join(projectPath, path.sep)) === 0) {
        return true;
      } else {
        return false;
      }
    }) : void 0 : void 0;
  };

  handleEvents() {
    this.browserWindow.on('close', function() {
      return global.atomApplication.saveState(false);
    });
    this.browserWindow.on('closed', (function(_this) {
      return function() {
        _this.fileRecoveryService.didCloseWindow(_this);
        return global.atomApplication.removeWindow(_this);
      };
    })(this));

    this.browserWindow.on('unresponsive', (function(_this) {
      return function() {
        var chosen;
        if (_this.isSpec) {
          return;
        }
        chosen = dialog.showMessageBox(_this.browserWindow, {
          type:    'warning',
          buttons: ['Close', 'Keep Waiting'],
          message: 'Editor is not responding',
          detail:  'The editor is not responding. Would you like to force close it or just keep waiting?'
        });
        if (chosen === 0) {
          return _this.browserWindow.destroy();
        }
      };
    })(this));

    this.browserWindow.webContents.on('crashed', (function(_this) {
      return function() {
        var chosen;
        if (_this.headless) {
          global.atomApplication.exit(100);
        }
        _this.fileRecoveryService.didCrashWindow(_this);
        chosen = dialog.showMessageBox(_this.browserWindow, {
          type:    'warning',
          buttons: ['Close Window', 'Reload', 'Keep It Open'],
          message: 'The editor has crashed',
          detail:  'Please report this issue to https://github.com/atom/atom'
        });
        switch(chosen) {
          case 0:
            return _this.browserWindow.destroy();
          case 1:
            return _this.browserWindow.reload();
        }
      };
    })(this));

    this.browserWindow.webContents.on('will-navigate', (function(_this) {
      return function(event, url) {
        if (url !== _this.browserWindow.webContents.getURL()) {
          return event.preventDefault();
        }
      };
    })(this));

    // this.setupContextMenu();

  };

  openPath(pathToOpen, initialLine, initialColumn) {
    return this.openLocations([
                                {
                                  pathToOpen:    pathToOpen,
                                  initialLine:   initialLine,
                                  initialColumn: initialColumn
                                }
                              ]);
  };

  openLocations(locationsToOpen) {
    if (this.loaded) {
      return this.sendMessage('open-locations', locationsToOpen);
    } else {
      return this.browserWindow.once('window:loaded', (function(_this) {
        return function() {
          return _this.openLocations(locationsToOpen);
        };
      })(this));
    }
  };

  replaceEnvironment(env) {
    return this.browserWindow.webContents.send('environment', env);
  };

  sendMessage(message, detail) {
    return this.browserWindow.webContents.send('message', message, detail);
  };

  sendCommand() {
    var args, command;
    command = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    if (this.isSpecWindow()) {
      if (!global.atomApplication.sendCommandToFirstResponder(command)) {
        switch(command) {
          case 'window:reload':
            return this.reload();
          case 'window:toggle-dev-tools':
            return this.toggleDevTools();
          case 'window:close':
            return this.close();
        }
      }
    } else if (this.isWebViewFocused()) {
      return this.sendCommandToBrowserWindow.apply(this, [command].concat(slice.call(args)));
    } else {
      if (!global.atomApplication.sendCommandToFirstResponder(command)) {
        return this.sendCommandToBrowserWindow.apply(this, [command].concat(slice.call(args)));
      }
    }
  };

  sendCommandToBrowserWindow() {
    var action, args, command, ref1, ref2;
    command = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    action = ((ref1 = args[0]) != null ? ref1.contextCommand : void 0) ? 'context-command' : 'command';
    return (ref2 = this.browserWindow.webContents).send.apply(ref2, [action, command].concat(slice.call(args)));
  };

  getDimensions() {
    var height, ref1, ref2, width, x, y;
    ref1 = this.browserWindow.getPosition(), x = ref1[0], y = ref1[1];
    ref2 = this.browserWindow.getSize(), width = ref2[0], height = ref2[1];
    return {
      x:      x,
      y:      y,
      width:  width,
      height: height
    };
  };

  close() {
    return this.browserWindow.close();
  };

  focus() {
    return this.browserWindow.focus();
  };

  minimize() {
    return this.browserWindow.minimize();
  };

  maximize() {
    return this.browserWindow.maximize();
  };

  restore() {
    return this.browserWindow.restore();
  };

  handlesAtomCommands() {
    return !this.isSpecWindow() && this.isWebViewFocused();
  };

  isFocused() {
    return this.browserWindow.isFocused();
  };

  isMaximized() {
    return this.browserWindow.isMaximized();
  };

  isMinimized() {
    return this.browserWindow.isMinimized();
  };

  isWebViewFocused() {
    return this.browserWindow.isWebViewFocused();
  };

  isSpecWindow() {
    return this.isSpec;
  };

  reload() {
    return this.browserWindow.reload();
  };

  toggleDevTools() {
    return this.browserWindow.toggleDevTools();
  };

}
