let slice = [].slice;

let AtomWindow          = require('./containers/AtomWindow');
// let ApplicationMenu = require('./application-menu');
let AtomProtocolHandler = require('./atom-protocol-handler');
// let AutoUpdateManager = require('./auto-update-manager');
// let StorageFolder       = require('../storage-folder');
// let Config              = require('../config');
// let FileRecoveryService = require('./file-recovery-service');
let ipcHelpers          = require('./ipc-helpers');
let ref                 = require('electron');
let BrowserWindow       = ref.BrowserWindow
let Menu                = ref.Menu
let app                 = ref.app
let dialog              = ref.dialog
let ipcMain             = ref.ipcMain
let shell               = ref.shell

let fs   = require('fs-plus');
let path = require('path');
let os   = require('os');
let net  = require('net');
let url  = require('url');

let EventEmitter = require('events').EventEmitter;
let _            = require('underscore-plus');

let FindParentDir        = null;
let Resolve              = null;
let LocationSuffixRegExp = /(:\d+)(:\d+)?$/;

export default class AtomApplication extends EventEmitter {

  static open(options) {
    var client, createAtomApplication;
    if (options.socketPath == null) {
      if (process.platform === 'win32') {
        options.socketPath = "\\\\.\\pipe\\atom-" + options.version + "-sock";
      } else {
        options.socketPath = path.join(os.tmpdir(), "atom-" + options.version + "-" + process.env.USER + ".sock");
      }
    }
    createAtomApplication = function() {
      return new AtomApplication(options);
    };
    if ((process.platform !== 'win32' && !fs.existsSync(options.socketPath)) || options.test) {
      createAtomApplication();
      return;
    }
    client = net.connect({
                           path: options.socketPath
                         }, function() {
      return client.write(JSON.stringify(options), function() {
        client.end();
        return app.quit();
      });
    });
    return client.on('error', createAtomApplication);
  };

  exit(status) {
    return app.exit(status);
  };

  constructor(options) {
    super()

    this.windows = null;
    this.applicationMenu = null;
    this.atomProtocolHandler = null;
    this.resourcePath = null;
    this.version = null;
    this.quitting = false;

    var clearWindowState, ref1, ref2, timeout;
    this.resourcePath = options.resourcePath, this.devResourcePath = options.devResourcePath, this.version = options.version, this.devMode = options.devMode, this.safeMode = options.safeMode, this.socketPath = options.socketPath, timeout = options.timeout, clearWindowState = options.clearWindowState;
    if (options.test) {
      this.socketPath = null;
    }
    global.atomApplication = this;
    this.pidsToOpenWindows = {};
    this.windows           = [];
    this.config            = new Config({
      configDirPath:     process.env.ATOM_HOME,
      resourcePath:      this.resourcePath,
      enablePersistence: true
    });
    this.config.setSchema(null, {
      type:       'object',
      properties: _.clone(require('../config-schema'))
    });
    this.config.load();
    this.autoUpdateManager   = new AutoUpdateManager(this.version, options.test, this.resourcePath, this.config);
    this.applicationMenu     = new ApplicationMenu(this.version, this.autoUpdateManager);
    this.atomProtocolHandler = new AtomProtocolHandler(this.resourcePath, this.safeMode);
    this.fileRecoveryService = new FileRecoveryService(path.join(process.env.ATOM_HOME, "recovery"));
    this.listenForArgumentsFromNewProcess();
    this.setupJavaScriptArguments();
    this.handleEvents();
    this.setupDockMenu();
    this.storageFolder = new StorageFolder(process.env.ATOM_HOME);
    if (((ref1 = options.pathsToOpen) != null ? ref1.length : void 0) > 0 || ((ref2 = options.urlsToOpen) != null ? ref2.length : void 0) > 0 || options.test) {
      this.openWithOptions(options);
    } else {
      this.loadState(options) || this.openPath(options);
    }
  }

  openWithOptions(arg) {
    var addToLastWindow, clearWindowState, devMode, env, executedFrom, i, initialPaths, len, logFile, newWindow, pathsToOpen, pidToKillWhenClosed, profileStartup, results, safeMode, test, timeout, urlToOpen, urlsToOpen;
    initialPaths = arg.initialPaths, pathsToOpen = arg.pathsToOpen, executedFrom = arg.executedFrom, urlsToOpen = arg.urlsToOpen, test = arg.test, pidToKillWhenClosed = arg.pidToKillWhenClosed, devMode = arg.devMode, safeMode = arg.safeMode, newWindow = arg.newWindow, logFile = arg.logFile, profileStartup = arg.profileStartup, timeout = arg.timeout, clearWindowState = arg.clearWindowState, addToLastWindow = arg.addToLastWindow, env = arg.env;
    if (test) {
      return this.runTests({
                             headless:     true,
                             devMode:      devMode,
                             resourcePath: this.resourcePath,
                             executedFrom: executedFrom,
                             pathsToOpen:  pathsToOpen,
                             logFile:      logFile,
                             timeout:      timeout,
                             env:          env
                           });
    } else if (pathsToOpen.length > 0) {
      return this.openPaths({
                              initialPaths:        initialPaths,
                              pathsToOpen:         pathsToOpen,
                              executedFrom:        executedFrom,
                              pidToKillWhenClosed: pidToKillWhenClosed,
                              newWindow:           newWindow,
                              devMode:             devMode,
                              safeMode:            safeMode,
                              profileStartup:      profileStartup,
                              clearWindowState:    clearWindowState,
                              addToLastWindow:     addToLastWindow,
                              env:                 env
                            });
    } else if (urlsToOpen.length > 0) {
      results = [];
      for (i = 0, len = urlsToOpen.length; i < len; i++) {
        urlToOpen = urlsToOpen[i];
        results.push(this.openUrl({
                                    urlToOpen: urlToOpen,
                                    devMode:   devMode,
                                    safeMode:  safeMode,
                                    env:       env
                                  }));
      }
      return results;
    } else {
      return this.openPath({
                             initialPaths:        initialPaths,
                             pidToKillWhenClosed: pidToKillWhenClosed,
                             newWindow:           newWindow,
                             devMode:             devMode,
                             safeMode:            safeMode,
                             profileStartup:      profileStartup,
                             clearWindowState:    clearWindowState,
                             addToLastWindow:     addToLastWindow,
                             env:                 env
                           });
    }
  };

  removeWindow(window) {
    var ref1, ref2;
    if (this.windows.length === 1) {
      if ((ref1 = this.applicationMenu) != null) {
        ref1.enableWindowSpecificItems(false);
      }
      if ((ref2 = process.platform) === 'win32' || ref2 === 'linux') {
        app.quit();
        return;
      }
    }
    this.windows.splice(this.windows.indexOf(window), 1);
    if (!window.isSpec) {
      return this.saveState(true);
    }
  };

  addWindow(window) {
    var blurHandler, focusHandler, ref1;
    this.windows.push(window);
    if ((ref1 = this.applicationMenu) != null) {
      ref1.addWindow(window.browserWindow);
    }
    window.once('window:loaded', (function(_this) {
      return function() {
        return _this.autoUpdateManager.emitUpdateAvailableEvent(window);
      };
    })(this));
    if (!window.isSpec) {
      focusHandler = (function(_this) {
        return function() {
          return _this.lastFocusedWindow = window;
        };
      })(this);
      blurHandler  = (function(_this) {
        return function() {
          return _this.saveState(false);
        };
      })(this);
      window.browserWindow.on('focus', focusHandler);
      window.browserWindow.on('blur', blurHandler);
      window.browserWindow.once('closed', (function(_this) {
        return function() {
          if (window === _this.lastFocusedWindow) {
            _this.lastFocusedWindow = null;
          }
          window.browserWindow.removeListener('focus', focusHandler);
          return window.browserWindow.removeListener('blur', blurHandler);
        };
      })(this));
      return window.browserWindow.webContents.once('did-finish-load', (function(_this) {
        return function() {
          return _this.saveState(false);
        };
      })(this));
    }
  };

  listenForArgumentsFromNewProcess() {
    var server;
    if (this.socketPath == null) {
      return;
    }
    this.deleteSocketFile();
    server = net.createServer((function(_this) {
      return function(connection) {
        var data;
        data = '';
        connection.on('data', function(chunk) {
          return data = data + chunk;
        });
        return connection.on('end', function() {
          var options;
          options = JSON.parse(data);
          return _this.openWithOptions(options);
        });
      };
    })(this));
    server.listen(this.socketPath);
    return server.on('error', function(error) {
      return console.error('Application server failed', error);
    });
  };

  deleteSocketFile() {
    var error, error1;
    if (process.platform === 'win32' || (this.socketPath == null)) {
      return;
    }
    if (fs.existsSync(this.socketPath)) {
      try {
        return fs.unlinkSync(this.socketPath);
      } catch(error1) {
        error = error1;
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }
    }
  };

  setupJavaScriptArguments() {
    return app.commandLine.appendSwitch('js-flags', '--harmony');
  };

  handleEvents() {
    var clipboard, getLoadSettings;
    getLoadSettings = (function(_this) {
      return function() {
        var ref1, ref2;
        return {
          devMode:  (ref1 = _this.focusedWindow()) != null ? ref1.devMode : void 0,
          safeMode: (ref2 = _this.focusedWindow()) != null ? ref2.safeMode : void 0
        };
      };
    })(this);
    this.on('application:quit', function() {
      return app.quit();
    });
    this.on('application:new-window', function() {
      return this.openPath(getLoadSettings());
    });
    this.on('application:new-file', function() {
      var ref1;
      return ((ref1 = this.focusedWindow()) != null ? ref1 : this).openPath();
    });
    this.on('application:open-dev', function() {
      return this.promptForPathToOpen('all', {
        devMode: true
      });
    });
    this.on('application:open-safe', function() {
      return this.promptForPathToOpen('all', {
        safeMode: true
      });
    });
    this.on('application:inspect', function(arg) {
      var atomWindow, x, y;
      x = arg.x, y = arg.y, atomWindow = arg.atomWindow;
      if (atomWindow == null) {
        atomWindow = this.focusedWindow();
      }
      return atomWindow != null ? atomWindow.browserWindow.inspectElement(x, y) : void 0;
    });
    this.on('application:open-documentation', function() {
      return shell.openExternal('https://flight-manual.atom.io/');
    });
    this.on('application:open-discussions', function() {
      return shell.openExternal('https://discuss.atom.io');
    });
    this.on('application:open-faq', function() {
      return shell.openExternal('https://atom.io/faq');
    });
    this.on('application:open-terms-of-use', function() {
      return shell.openExternal('https://atom.io/terms');
    });
    this.on('application:report-issue', function() {
      return shell.openExternal('https://github.com/atom/atom/blob/master/CONTRIBUTING.md#submitting-issues');
    });
    this.on('application:search-issues', function() {
      return shell.openExternal('https://github.com/issues?q=+is%3Aissue+user%3Aatom');
    });
    this.on('application:install-update', (function(_this) {
      return function() {
        _this.quitting = true;
        return _this.autoUpdateManager.install();
      };
    })(this));
    this.on('application:check-for-update', (function(_this) {
      return function() {
        return _this.autoUpdateManager.check();
      };
    })(this));
    if (process.platform === 'darwin') {
      this.on('application:bring-all-windows-to-front', function() {
        return Menu.sendActionToFirstResponder('arrangeInFront:');
      });
      this.on('application:hide', function() {
        return Menu.sendActionToFirstResponder('hide:');
      });
      this.on('application:hide-other-applications', function() {
        return Menu.sendActionToFirstResponder('hideOtherApplications:');
      });
      this.on('application:minimize', function() {
        return Menu.sendActionToFirstResponder('performMiniaturize:');
      });
      this.on('application:unhide-all-applications', function() {
        return Menu.sendActionToFirstResponder('unhideAllApplications:');
      });
      this.on('application:zoom', function() {
        return Menu.sendActionToFirstResponder('zoom:');
      });
    } else {
      this.on('application:minimize', function() {
        var ref1;
        return (ref1 = this.focusedWindow()) != null ? ref1.minimize() : void 0;
      });
      this.on('application:zoom', function() {
        var ref1;
        return (ref1 = this.focusedWindow()) != null ? ref1.maximize() : void 0;
      });
    }
    this.openPathOnEvent('application:about', 'atom://about');
    this.openPathOnEvent('application:show-settings', 'atom://config');
    this.openPathOnEvent('application:open-your-config', 'atom://.atom/config');
    this.openPathOnEvent('application:open-your-init-script', 'atom://.atom/init-script');
    this.openPathOnEvent('application:open-your-keymap', 'atom://.atom/keymap');
    this.openPathOnEvent('application:open-your-snippets', 'atom://.atom/snippets');
    this.openPathOnEvent('application:open-your-stylesheet', 'atom://.atom/stylesheet');
    this.openPathOnEvent('application:open-license', path.join(process.resourcesPath, 'LICENSE.md'));
    app.on('before-quit', (function(_this) {
      return function() {
        return _this.quitting = true;
      };
    })(this));
    app.on('will-quit', (function(_this) {
      return function() {
        _this.killAllProcesses();
        return _this.deleteSocketFile();
      };
    })(this));
    app.on('open-file', (function(_this) {
      return function(event, pathToOpen) {
        event.preventDefault();
        return _this.openPath({
                                pathToOpen: pathToOpen
                              });
      };
    })(this));
    app.on('open-url', (function(_this) {
      return function(event, urlToOpen) {
        event.preventDefault();
        return _this.openUrl({
                               urlToOpen: urlToOpen,
                               devMode:   _this.devMode,
                               safeMode:  _this.safeMode
                             });
      };
    })(this));
    app.on('activate-with-no-open-windows', (function(_this) {
      return function(event) {
        if (event != null) {
          event.preventDefault();
        }
        return _this.emit('application:new-window');
      };
    })(this));
    ipcMain.on('open', (function(_this) {
      return function(event, options) {
        var ref1, window;
        window = _this.windowForEvent(event);
        if (options != null) {
          if (typeof options.pathsToOpen === 'string') {
            options.pathsToOpen = [options.pathsToOpen];
          }
          if (((ref1 = options.pathsToOpen) != null ? ref1.length : void 0) > 0) {
            options.window = window;
            return _this.openPaths(options);
          } else {
            return new AtomWindow(_this.fileRecoveryService, options);
          }
        } else {
          return _this.promptForPathToOpen('all', {
            window: window
          });
        }
      };
    })(this));
    ipcMain.on('update-application-menu', (function(_this) {
      return function(event, template, keystrokesByCommand) {
        var win;
        win = BrowserWindow.fromWebContents(event.sender);
        return _this.applicationMenu.update(win, template, keystrokesByCommand);
      };
    })(this));
    ipcMain.on('run-package-specs', (function(_this) {
      return function(event, packageSpecPath) {
        return _this.runTests({
                                resourcePath: _this.devResourcePath,
                                pathsToOpen:  [packageSpecPath],
                                headless:     false
                              });
      };
    })(this));
    ipcMain.on('command', (function(_this) {
      return function(event, command) {
        return _this.emit(command);
      };
    })(this));
    ipcMain.on('open-command', (function(_this) {
      return function() {
        var args, command, defaultPath, event;
        event = arguments[0], command = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        if (args.length > 0) {
          defaultPath = args[0];
        }
        switch(command) {
          case 'application:open':
            return _this.promptForPathToOpen('all', getLoadSettings(), defaultPath);
          case 'application:open-file':
            return _this.promptForPathToOpen('file', getLoadSettings(), defaultPath);
          case 'application:open-folder':
            return _this.promptForPathToOpen('folder', getLoadSettings(), defaultPath);
          default:
            return console.log("Invalid open-command received: " + command);
        }
      };
    })(this));
    ipcMain.on('window-command', function() {
      var args, command, event, win;
      event = arguments[0], command = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
      win = BrowserWindow.fromWebContents(event.sender);
      return win.emit.apply(win, [command].concat(slice.call(args)));
    });
    ipcMain.on('call-window-method', function() {
      var args, event, method, win;
      event = arguments[0], method = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
      win = BrowserWindow.fromWebContents(event.sender);
      return win[method].apply(win, args);
    });
    ipcMain.on('pick-folder', (function(_this) {
      return function(event, responseChannel) {
        return _this.promptForPath("folder", function(selectedPaths) {
          return event.sender.send(responseChannel, selectedPaths);
        });
      };
    })(this));
    ipcHelpers.respondTo('set-window-size', function(win, width, height) {
      return win.setSize(width, height);
    });
    ipcHelpers.respondTo('set-window-position', function(win, x, y) {
      return win.setPosition(x, y);
    });
    ipcHelpers.respondTo('center-window', function(win) {
      return win.center();
    });
    ipcHelpers.respondTo('focus-window', function(win) {
      return win.focus();
    });
    ipcHelpers.respondTo('show-window', function(win) {
      return win.show();
    });
    ipcHelpers.respondTo('hide-window', function(win) {
      return win.hide();
    });
    ipcHelpers.respondTo('get-temporary-window-state', function(win) {
      return win.temporaryState;
    });
    ipcHelpers.respondTo('set-temporary-window-state', function(win, state) {
      return win.temporaryState = state;
    });
    ipcMain.on('did-cancel-window-unload', (function(_this) {
      return function() {
        return _this.quitting = false;
      };
    })(this));
    clipboard = require('../safe-clipboard');
    ipcMain.on('write-text-to-selection-clipboard', function(event, selectedText) {
      return clipboard.writeText(selectedText, 'selection');
    });
    ipcMain.on('write-to-stdout', function(event, output) {
      return process.stdout.write(output);
    });
    ipcMain.on('write-to-stderr', function(event, output) {
      return process.stderr.write(output);
    });
    ipcMain.on('add-recent-document', function(event, filename) {
      return app.addRecentDocument(filename);
    });
    ipcMain.on('execute-javascript-in-dev-tools', function(event, code) {
      var ref1;
      return (ref1 = event.sender.devToolsWebContents) != null ? ref1.executeJavaScript(code) : void 0;
    });
    ipcMain.on('get-auto-update-manager-state', (function(_this) {
      return function(event) {
        return event.returnValue = _this.autoUpdateManager.getState();
      };
    })(this));
    ipcMain.on('get-auto-update-manager-error', (function(_this) {
      return function(event) {
        return event.returnValue = _this.autoUpdateManager.getErrorMessage();
      };
    })(this));
    ipcMain.on('will-save-path', (function(_this) {
      return function(event, path) {
        _this.fileRecoveryService.willSavePath(_this.windowForEvent(event), path);
        return event.returnValue = true;
      };
    })(this));
    return ipcMain.on('did-save-path', (function(_this) {
      return function(event, path) {
        _this.fileRecoveryService.didSavePath(_this.windowForEvent(event), path);
        return event.returnValue = true;
      };
    })(this));
  };

  setupDockMenu() {
    var dockMenu;
    if (process.platform === 'darwin') {
      dockMenu = Menu.buildFromTemplate([
                                          {
                                            label: 'New Window',
                                            click: (function(_this) {
                                              return function() {
                                                return _this.emit('application:new-window');
                                              };
                                            })(this)
                                          }
                                        ]);
      return app.dock.setMenu(dockMenu);
    }
  };

  sendCommand() {
    var args, command, focusedWindow;
    command = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    if (!this.emit.apply(this, [command].concat(slice.call(args)))) {
      focusedWindow = this.focusedWindow();
      if (focusedWindow != null) {
        return focusedWindow.sendCommand.apply(focusedWindow, [command].concat(slice.call(args)));
      } else {
        return this.sendCommandToFirstResponder(command);
      }
    }
  };

  sendCommandToWindow() {
    var args, atomWindow, command;
    command = arguments[0], atomWindow = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
    if (!this.emit.apply(this, [command].concat(slice.call(args)))) {
      if (atomWindow != null) {
        return atomWindow.sendCommand.apply(atomWindow, [command].concat(slice.call(args)));
      } else {
        return this.sendCommandToFirstResponder(command);
      }
    }
  };

  sendCommandToFirstResponder(command) {
    if (process.platform !== 'darwin') {
      return false;
    }
    switch(command) {
      case 'core:undo':
        Menu.sendActionToFirstResponder('undo:');
        break;
      case 'core:redo':
        Menu.sendActionToFirstResponder('redo:');
        break;
      case 'core:copy':
        Menu.sendActionToFirstResponder('copy:');
        break;
      case 'core:cut':
        Menu.sendActionToFirstResponder('cut:');
        break;
      case 'core:paste':
        Menu.sendActionToFirstResponder('paste:');
        break;
      case 'core:select-all':
        Menu.sendActionToFirstResponder('selectAll:');
        break;
      default:
        return false;
    }
    return true;
  };

  openPathOnEvent(eventName, pathToOpen) {
    return this.on(eventName, function() {
      var window;
      if (window = this.focusedWindow()) {
        return window.openPath(pathToOpen);
      } else {
        return this.openPath({
                               pathToOpen: pathToOpen
                             });
      }
    });
  };

  windowForPaths(pathsToOpen, devMode) {
    return _.find(this.windows, function(atomWindow) {
      return atomWindow.devMode === devMode && atomWindow.containsPaths(pathsToOpen);
    });
  };

  windowForEvent(arg) {
    var sender, window;
    sender = arg.sender;
    window = BrowserWindow.fromWebContents(sender);
    return _.find(this.windows, function(arg1) {
      var browserWindow;
      browserWindow = arg1.browserWindow;
      return window === browserWindow;
    });
  };

  focusedWindow() {
    return _.find(this.windows, function(atomWindow) {
      return atomWindow.isFocused();
    });
  };

  getWindowOffsetForCurrentPlatform() {
    var offsetByPlatform, ref1;
    offsetByPlatform = {
      darwin: 22,
      win32:  26
    };
    return (ref1 = offsetByPlatform[process.platform]) != null ? ref1 : 0;
  };

  getDimensionsForNewWindow() {
    var dimensions, offset, ref1, ref2, ref3, ref4;
    if ((ref1 = (ref2 = this.focusedWindow()) != null ? ref2 : this.lastFocusedWindow) != null ? ref1.isMaximized() : void 0) {
      return;
    }
    dimensions = (ref3 = (ref4 = this.focusedWindow()) != null ? ref4 : this.lastFocusedWindow) != null ? ref3.getDimensions() : void 0;
    offset     = this.getWindowOffsetForCurrentPlatform();
    if ((dimensions != null) && (offset != null)) {
      dimensions.x += offset;
      dimensions.y += offset;
    }
    return dimensions;
  };

  openPath(arg) {
    var addToLastWindow, clearWindowState, devMode, env, initialPaths, newWindow, pathToOpen, pidToKillWhenClosed, profileStartup, ref1, safeMode, window;
    ref1 = arg != null ? arg : {}, initialPaths = ref1.initialPaths, pathToOpen = ref1.pathToOpen, pidToKillWhenClosed = ref1.pidToKillWhenClosed, newWindow = ref1.newWindow, devMode = ref1.devMode, safeMode = ref1.safeMode, profileStartup = ref1.profileStartup, window = ref1.window, clearWindowState = ref1.clearWindowState, addToLastWindow = ref1.addToLastWindow, env = ref1.env;
    return this.openPaths({
                            initialPaths:        initialPaths,
                            pathsToOpen:         [pathToOpen],
                            pidToKillWhenClosed: pidToKillWhenClosed,
                            newWindow:           newWindow,
                            devMode:             devMode,
                            safeMode:            safeMode,
                            profileStartup:      profileStartup,
                            window:              window,
                            clearWindowState:    clearWindowState,
                            addToLastWindow:     addToLastWindow,
                            env:                 env
                          });
  };

  openPaths(arg) {
    var addToLastWindow, clearWindowState, currentWindow, devMode, env, executedFrom, existingWindow, initialPaths, locationToOpen, locationsToOpen, newWindow, openedWindow, pathToOpen, pathsToOpen, pidToKillWhenClosed, profileStartup, ref1, resourcePath, safeMode, stats, window, windowDimensions, windowInitializationScript;
    ref1 = arg != null ? arg : {}, initialPaths = ref1.initialPaths, pathsToOpen = ref1.pathsToOpen, executedFrom = ref1.executedFrom, pidToKillWhenClosed = ref1.pidToKillWhenClosed, newWindow = ref1.newWindow, devMode = ref1.devMode, safeMode = ref1.safeMode, windowDimensions = ref1.windowDimensions, profileStartup = ref1.profileStartup, window = ref1.window, clearWindowState = ref1.clearWindowState, addToLastWindow = ref1.addToLastWindow, env = ref1.env;
    if ((pathsToOpen == null) || pathsToOpen.length === 0) {
      return;
    }
    devMode          = Boolean(devMode);
    safeMode         = Boolean(safeMode);
    clearWindowState = Boolean(clearWindowState);
    locationsToOpen  = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = pathsToOpen.length; i < len; i++) {
        pathToOpen = pathsToOpen[i];
        results.push(this.locationForPathToOpen(pathToOpen, executedFrom, addToLastWindow));
      }
      return results;
    }).call(this);
    pathsToOpen      = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = locationsToOpen.length; i < len; i++) {
        locationToOpen = locationsToOpen[i];
        results.push(locationToOpen.pathToOpen);
      }
      return results;
    })();
    if (!(pidToKillWhenClosed || newWindow)) {
      existingWindow = this.windowForPaths(pathsToOpen, devMode);
      stats          = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = pathsToOpen.length; i < len; i++) {
          pathToOpen = pathsToOpen[i];
          results.push(fs.statSyncNoException(pathToOpen));
        }
        return results;
      })();
      if (existingWindow == null) {
        if (currentWindow = window != null ? window : this.lastFocusedWindow) {
          if (addToLastWindow || currentWindow.devMode === devMode && (stats.every(function(stat) {
              return typeof stat.isFile === "function" ? stat.isFile() : void 0;
            }) || stats.some(function(stat) {
              return (typeof stat.isDirectory === "function" ? stat.isDirectory() : void 0) && !currentWindow.hasProjectPath();
            }))) {
            existingWindow = currentWindow;
          }
        }
      }
    }
    if (existingWindow != null) {
      openedWindow = existingWindow;
      openedWindow.openLocations(locationsToOpen);
      if (openedWindow.isMinimized()) {
        openedWindow.restore();
      } else {
        openedWindow.focus();
      }
      openedWindow.replaceEnvironment(env);
    } else {
      if (devMode) {
        try {
          windowInitializationScript = require.resolve(path.join(this.devResourcePath, 'src', 'initialize-application-window'));
          resourcePath               = this.devResourcePath;
        } catch(undefined) {
        }
      }
      if (windowInitializationScript == null) {
        windowInitializationScript = require.resolve('../initialize-application-window');
      }
      if (resourcePath == null) {
        resourcePath = this.resourcePath;
      }
      if (windowDimensions == null) {
        windowDimensions = this.getDimensionsForNewWindow();
      }
      openedWindow = new AtomWindow(this.fileRecoveryService, {
        initialPaths:               initialPaths,
        locationsToOpen:            locationsToOpen,
        windowInitializationScript: windowInitializationScript,
        resourcePath:               resourcePath,
        devMode:                    devMode,
        safeMode:                   safeMode,
        windowDimensions:           windowDimensions,
        profileStartup:             profileStartup,
        clearWindowState:           clearWindowState,
        env:                        env
      });
    }
    if (pidToKillWhenClosed != null) {
      this.pidsToOpenWindows[pidToKillWhenClosed] = openedWindow;
    }
    return openedWindow.browserWindow.once('closed', (function(_this) {
      return function() {
        return _this.killProcessForWindow(openedWindow);
      };
    })(this));
  };

  killAllProcesses() {
    var pid;
    for (pid in this.pidsToOpenWindows) {
      this.killProcess(pid);
    }
  };

  killProcessForWindow(openedWindow) {
    var pid, ref1, trackedWindow;
    ref1 = this.pidsToOpenWindows;
    for (pid in ref1) {
      trackedWindow = ref1[pid];
      if (trackedWindow === openedWindow) {
        this.killProcess(pid);
      }
    }
  };

  killProcess(pid) {
    var error, error1, parsedPid, ref1;
    try {
      parsedPid = parseInt(pid);
      if (isFinite(parsedPid)) {
        process.kill(parsedPid);
      }
    } catch(error1) {
      error = error1;
      if (error.code !== 'ESRCH') {
        console.log("Killing process " + pid + " failed: " + ((ref1 = error.code) != null ? ref1 : error.message));
      }
    }
    return delete this.pidsToOpenWindows[pid];
  };

  saveState(allowEmpty) {
    var i, len, loadSettings, ref1, states, window;
    if (allowEmpty == null) {
      allowEmpty = false;
    }
    if (this.quitting) {
      return;
    }
    states = [];
    ref1   = this.windows;
    for (i = 0, len = ref1.length; i < len; i++) {
      window = ref1[i];
      if (!window.isSpec) {
        if (loadSettings = window.getLoadSettings()) {
          states.push({
                        initialPaths: loadSettings.initialPaths
                      });
        }
      }
    }
    if (states.length > 0 || allowEmpty) {
      return this.storageFolder.storeSync('application.json', states);
    }
  };

  loadState(options) {
    var i, len, ref1, ref2, restorePreviousState, state, states;
    restorePreviousState = (ref1 = this.config.get('core.restorePreviousWindowsOnStart')) != null ? ref1 : true;
    if (restorePreviousState && ((ref2 = (states = this.storageFolder.load('application.json'))) != null ? ref2.length : void 0) > 0) {
      for (i = 0, len = states.length; i < len; i++) {
        state = states[i];
        this.openWithOptions(Object.assign(options, {
          initialPaths: state.initialPaths,
          pathsToOpen:  state.initialPaths.filter(function(directoryPath) {
            return fs.isDirectorySync(directoryPath);
          }),
          urlsToOpen:   [],
          devMode:      this.devMode,
          safeMode:     this.safeMode
        }));
      }
      return true;
    } else {
      return false;
    }
  };

  openUrl(arg) {
    var PackageManager, devMode, env, pack, packageName, packagePath, safeMode, urlToOpen, windowDimensions, windowInitializationScript;
    urlToOpen = arg.urlToOpen, devMode = arg.devMode, safeMode = arg.safeMode, env = arg.env;
    if (this.packages == null) {
      PackageManager = require('../package-manager');
      this.packages  = new PackageManager({
        configDirPath: process.env.ATOM_HOME,
        devMode:       devMode,
        resourcePath:  this.resourcePath
      });
    }
    packageName = url.parse(urlToOpen).host;
    pack        = _.find(this.packages.getAvailablePackageMetadata(), function(arg1) {
      var name;
      name = arg1.name;
      return name === packageName;
    });
    if (pack != null) {
      if (pack.urlMain) {
        packagePath                = this.packages.resolvePackagePath(packageName);
        windowInitializationScript = path.resolve(packagePath, pack.urlMain);
        windowDimensions           = this.getDimensionsForNewWindow();
        return new AtomWindow(this.fileRecoveryService, {
          windowInitializationScript: windowInitializationScript,
          resourcePath:               this.resourcePath,
          devMode:                    devMode,
          safeMode:                   safeMode,
          urlToOpen:                  urlToOpen,
          windowDimensions:           windowDimensions,
          env:                        env
        });
      } else {
        return console.log("Package '" + pack.name + "' does not have a url main: " + urlToOpen);
      }
    } else {
      return console.log("Opening unknown url: " + urlToOpen);
    }
  };

  runTests(arg) {
    var devMode, env, error, error1, executedFrom, headless, i, isSpec, legacyTestRunnerPath, len, logFile, pathToOpen, pathsToOpen, resourcePath, safeMode, testPaths, testRunnerPath, timeout, timeoutHandler, timeoutInSeconds, windowInitializationScript;
    headless = arg.headless, resourcePath = arg.resourcePath, executedFrom = arg.executedFrom, pathsToOpen = arg.pathsToOpen, logFile = arg.logFile, safeMode = arg.safeMode, timeout = arg.timeout, env = arg.env;
    if (resourcePath !== this.resourcePath && !fs.existsSync(resourcePath)) {
      resourcePath = this.resourcePath;
    }
    timeoutInSeconds = Number.parseFloat(timeout);
    if (!Number.isNaN(timeoutInSeconds)) {
      timeoutHandler = function() {
        console.log("The test suite has timed out because it has been running for more than " + timeoutInSeconds + " seconds.");
        return process.exit(124);
      };
      setTimeout(timeoutHandler, timeoutInSeconds * 1000);
    }
    try {
      windowInitializationScript = require.resolve(path.resolve(this.devResourcePath, 'src', 'initialize-test-window'));
    } catch(error1) {
      error                      = error1;
      windowInitializationScript = require.resolve(path.resolve(__dirname, '..', '..', 'src', 'initialize-test-window'));
    }
    testPaths = [];
    if (pathsToOpen != null) {
      for (i = 0, len = pathsToOpen.length; i < len; i++) {
        pathToOpen = pathsToOpen[i];
        testPaths.push(path.resolve(executedFrom, fs.normalize(pathToOpen)));
      }
    }
    if (testPaths.length === 0) {
      process.stderr.write('Error: Specify at least one test path\n\n');
      process.exit(1);
    }
    legacyTestRunnerPath = this.resolveLegacyTestRunnerPath();
    testRunnerPath       = this.resolveTestRunnerPath(testPaths[0]);
    devMode              = true;
    isSpec               = true;
    if (safeMode == null) {
      safeMode = false;
    }
    return new AtomWindow(this.fileRecoveryService, {
      windowInitializationScript: windowInitializationScript,
      resourcePath:               resourcePath,
      headless:                   headless,
      isSpec:                     isSpec,
      devMode:                    devMode,
      testRunnerPath:             testRunnerPath,
      legacyTestRunnerPath:       legacyTestRunnerPath,
      testPaths:                  testPaths,
      logFile:                    logFile,
      safeMode:                   safeMode,
      env:                        env
    });
  };

  resolveTestRunnerPath(testPath) {
    var packageMetadata, packageRoot, testRunnerPath;
    if (FindParentDir == null) {
      FindParentDir = require('find-parent-dir');
    }
    if (packageRoot = FindParentDir.sync(testPath, 'package.json')) {
      packageMetadata = require(path.join(packageRoot, 'package.json'));
      if (packageMetadata.atomTestRunner) {
        if (Resolve == null) {
          Resolve = require('resolve');
        }
        if (testRunnerPath = Resolve.sync(packageMetadata.atomTestRunner, {
            basedir:    packageRoot,
            extensions: Object.keys(require.extensions)
          })) {
          return testRunnerPath;
        } else {
          process.stderr.write("Error: Could not resolve test runner path '" + packageMetadata.atomTestRunner + "'");
          process.exit(1);
        }
      }
    }
    return this.resolveLegacyTestRunnerPath();
  };

  resolveLegacyTestRunnerPath() {
    var error, error1;
    try {
      return require.resolve(path.resolve(this.devResourcePath, 'spec', 'jasmine-test-runner'));
    } catch(error1) {
      error = error1;
      return require.resolve(path.resolve(__dirname, '..', '..', 'spec', 'jasmine-test-runner'));
    }
  };

  locationForPathToOpen(pathToOpen, executedFrom, forceAddToWindow) {
    var initialColumn, initialLine, match;
    if (executedFrom == null) {
      executedFrom = '';
    }
    if (!pathToOpen) {
      return {
        pathToOpen: pathToOpen
      };
    }
    pathToOpen = pathToOpen.replace(/[:\s]+$/, '');
    match      = pathToOpen.match(LocationSuffixRegExp);
    if (match != null) {
      pathToOpen = pathToOpen.slice(0, -match[0].length);
      if (match[1]) {
        initialLine = Math.max(0, parseInt(match[1].slice(1)) - 1);
      }
      if (match[2]) {
        initialColumn = Math.max(0, parseInt(match[2].slice(1)) - 1);
      }
    } else {
      initialLine = initialColumn = null;
    }
    if (url.parse(pathToOpen).protocol == null) {
      pathToOpen = path.resolve(executedFrom, fs.normalize(pathToOpen));
    }
    return {
      pathToOpen:       pathToOpen,
      initialLine:      initialLine,
      initialColumn:    initialColumn,
      forceAddToWindow: forceAddToWindow
    };
  };

  promptForPathToOpen(type, arg, path) {
    var devMode, safeMode, window;
    devMode = arg.devMode, safeMode = arg.safeMode, window = arg.window;
    if (path == null) {
      path = null;
    }
    return this.promptForPath(type, ((function(_this) {
      return function(pathsToOpen) {
        return _this.openPaths({
                                 pathsToOpen: pathsToOpen,
                                 devMode:     devMode,
                                 safeMode:    safeMode,
                                 window:      window
                               });
      };
    })(this)), path);
  };

  promptForPath(type, callback, path) {
    var openOptions, parentWindow, properties;
    properties   = (function() {
      switch(type) {
        case 'file':
          return ['openFile'];
        case 'folder':
          return ['openDirectory'];
        case 'all':
          return ['openFile', 'openDirectory'];
        default:
          throw new Error(type + " is an invalid type for promptForPath");
      }
    })();
    parentWindow = process.platform === 'darwin' ? null : BrowserWindow.getFocusedWindow();
    openOptions  = {
      properties: properties.concat(['multiSelections', 'createDirectory']),
      title:      (function() {
        switch(type) {
          case 'file':
            return 'Open File';
          case 'folder':
            return 'Open Folder';
          default:
            return 'Open';
        }
      })()
    };
    if (path != null) {
      openOptions.defaultPath = path;
    }
    return dialog.showOpenDialog(parentWindow, openOptions, callback);
  };
}
