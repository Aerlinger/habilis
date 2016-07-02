global.shellStartTime = Date.now();



process.on('uncaughtException', function(error) {
  if (error == null) {
    error = {};
  }
  if (error.message != null) {
    console.log(error.message);
  }
  if (error.stack != null) {
    return console.log(error.stack);
  }
});

let app   = require('electron').app;
let fs    = require('fs-plus');
let path  = require('path');
let temp  = require('temp');
let yargs = require('yargs');

let previousConsoleLog = console.log;

// console.log = require('nslog');

export function start() {
  // let args = parseCommandLine();
  let args = {}
  args.env = process.env;

  // setupAtomHome(args);
  // setupCompileCache();

  app.setAppUserModelId('com.squirrel.atom.atom');

  let addPathToOpen = function(event, pathToOpen) {
    event.preventDefault();

    return args.pathsToOpen.push(pathToOpen);
  };

  let addUrlToOpen = function(event, urlToOpen) {
    event.preventDefault();
    return args.urlsToOpen.push(urlToOpen);
  };

  app.on('open-file', addPathToOpen);
  app.on('open-url', addUrlToOpen);
  // app.on('will-finish-launching', startCrashReporter);

  if (args.userDataDir != null) {
    app.setPath('userData', args.userDataDir);
  } else if (args.test) {
    app.setPath('userData', temp.mkdirSync('atom-test-data'));
  }

  return app.on('ready', function() {
    app.removeListener('open-file', addPathToOpen);
    app.removeListener('open-url', addUrlToOpen);

    let AtomApplication = require('./AtomApplication');
    AtomApplication.open(args);

    if (!args.test) {
      return console.log("App load time: " + (Date.now() - global.shellStartTime) + "ms");
    }
  });
};

/*
export function setupCompileCache() {
  let compileCache = require('../compile-cache');
  return compileCache.setAtomHomeDirectory(process.env.ATOM_HOME);
};
*/

export function writeFullVersion() {
  return process.stdout.write("Atom    : " + (app.getVersion()) + "\nElectron: " + process.versions.electron + "\nChrome  : " + process.versions.chrome + "\nNode    : " + process.versions.node + "\n");
};

export function parseCommandLine() {
  var addToLastWindow,
      args,
      clearWindowState,
      devMode,
      devResourcePath,
      executedFrom,
      logFile,
      mainProcess,
      newWindow,
      options,
      pathsToOpen,
      pidToKillWhenClosed,
      profileStartup,
      resourcePath,
      safeMode,
      setPortable,
      socketPath,
      test,
      timeout,
      urlsToOpen,
      userDataDir,
      version,
      _ref,
      _ref1,
      _ref2;

  version = app.getVersion();
  options = yargs(process.argv.slice(1)).wrap(100);
  options.usage("Atom Editor v" + version + "\n\nUsage: atom [options] [path ...]\n\nOne or more paths to files or folders may be specified. If there is an\nexisting Atom window that contains all of the given folders, the paths\nwill be opened in that window. Otherwise, they will be opened in a new\nwindow.\n\nEnvironment Variables:\n\n  ATOM_DEV_RESOURCE_PATH  The path from which Atom loads source code in dev mode.\n                          Defaults to `~/github/atom`.\n\n  ATOM_HOME               The root path for all configuration files and folders.\n                          Defaults to `~/.atom`.");
  options.alias('1', 'one').boolean('1').describe('1', 'This option is no longer supported.');
  options.boolean('include-deprecated-apis').describe('include-deprecated-apis', 'This option is not currently supported.');
  options.alias('d', 'dev').boolean('d').describe('d', 'Run in development mode.');
  options.alias('f', 'foreground').boolean('f').describe('f', 'Keep the main process in the foreground.');
  options.alias('h', 'help').boolean('h').describe('h', 'Print this usage message.');
  options.alias('l', 'log-file').string('l').describe('l', 'Log all output to file.');
  options.alias('n', 'new-window').boolean('n').describe('n', 'Open a new window.');
  options.boolean('profile-startup').describe('profile-startup', 'Create a profile of the startup execution time.');
  options.alias('r', 'resource-path').string('r').describe('r', 'Set the path to the Atom source directory and enable dev-mode.');
  options.boolean('safe').describe('safe', 'Do not load packages from ~/.atom/packages or ~/.atom/dev/packages.');
  options.boolean('portable').describe('portable', 'Set portable mode. Copies the ~/.atom folder to be a sibling of the installed Atom location if a .atom folder is not already there.');
  options.alias('t', 'test').boolean('t').describe('t', 'Run the specified specs and exit with error code on failures.');
  options.alias('m', 'main-process').boolean('m').describe('m', 'Run the specified specs in the main process.');
  options.string('timeout').describe('timeout', 'When in test mode, waits until the specified time (in minutes) and kills the process (exit code: 130).');
  options.alias('v', 'version').boolean('v').describe('v', 'Print the version information.');
  options.alias('w', 'wait').boolean('w').describe('w', 'Wait for window to be closed before returning.');
  options.alias('a', 'add').boolean('a').describe('add', 'Open path as a new project in last used window.');
  options.string('socket-path');
  options.string('user-data-dir');
  options.boolean('clear-window-state').describe('clear-window-state', 'Delete all Atom environment state.');

  args = options.argv;

  if (args.help) {
    process.stdout.write(options.help());
    process.exit(0);
  }

  if (args.version) {
    writeFullVersion();
    process.exit(0);
  }

  addToLastWindow = args['add'];
  executedFrom    = (_ref = (_ref1 = args['executed-from']) != null ? _ref1.toString() : void 0) != null ? _ref : process.cwd();
  devMode         = args['dev'];
  safeMode        = args['safe'];
  pathsToOpen     = args._;
  test            = args['test'];
  mainProcess     = args['main-process'];
  timeout         = args['timeout'];
  newWindow       = args['new-window'];
  if (args['wait']) {
    pidToKillWhenClosed = args['pid'];
  }
  logFile          = args['log-file'];
  socketPath       = args['socket-path'];
  userDataDir      = args['user-data-dir'];
  profileStartup   = args['profile-startup'];
  clearWindowState = args['clear-window-state'];
  urlsToOpen       = [];
  devResourcePath  = (_ref2 = process.env.ATOM_DEV_RESOURCE_PATH) != null ? _ref2 : path.join(app.getPath('home'), 'github', 'atom');
  setPortable      = args.portable;

  if (args['resource-path']) {
    devMode      = true;
    resourcePath = args['resource-path'];
  }

  if (test) {
    devMode = true;
  }

  if (devMode) {
    if (resourcePath == null) {
      resourcePath = devResourcePath;
    }
  }

  if (!fs.statSyncNoException(resourcePath)) {
    resourcePath = path.dirname(path.dirname(__dirname));
  }

  if (args['path-environment']) {
    process.env.PATH = args['path-environment'];
  }

  resourcePath    = normalizeDriveLetterName(resourcePath);
  devResourcePath = normalizeDriveLetterName(devResourcePath);

  return {
    resourcePath:        resourcePath,
    devResourcePath:     devResourcePath,
    pathsToOpen:         pathsToOpen,
    urlsToOpen:          urlsToOpen,
    executedFrom:        executedFrom,
    test:                test,
    version:             version,
    pidToKillWhenClosed: pidToKillWhenClosed,
    devMode:             devMode,
    safeMode:            safeMode,
    newWindow:           newWindow,
    logFile:             logFile,
    socketPath:          socketPath,
    userDataDir:         userDataDir,
    profileStartup:      profileStartup,
    timeout:             timeout,
    setPortable:         setPortable,
    clearWindowState:    clearWindowState,
    addToLastWindow:     addToLastWindow,
    mainProcess:         mainProcess
  };
}
;

start();
