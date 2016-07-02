let ref = require('electron')
let app = ref.app
let protocol = ref.protocol;
let fs = require('fs')
let path = require('path')

export default class AtomProtocolHandler {
  constructor(resourcePath, safeMode) {
    this.loadPaths = [];
    if (!safeMode) {
      this.loadPaths.push(path.join(process.env.ATOM_HOME, 'dev', 'packages'));
    }
    this.loadPaths.push(path.join(process.env.ATOM_HOME, 'packages'));
    this.loadPaths.push(path.join(resourcePath, 'node_modules'));
    this.registerAtomProtocol();
  }

  registerAtomProtocol() {
    return protocol.registerFileProtocol('atom', (function(_this) {
      return function(request, callback) {
        var assetsPath, base, base1, filePath, i, len, loadPath, ref1, relativePath;
        relativePath = path.normalize(request.url.substr(7));
        if (relativePath.indexOf('assets/') === 0) {
          assetsPath = path.join(process.env.ATOM_HOME, relativePath);
          if (typeof (base = fs.statSyncNoException(assetsPath)).isFile === "function" ? base.isFile() : void 0) {
            filePath = assetsPath;
          }
        }
        if (!filePath) {
          ref1 = _this.loadPaths;
          for (i = 0, len = ref1.length; i < len; i++) {
            loadPath = ref1[i];
            filePath = path.join(loadPath, relativePath);
            if (typeof (base1 = fs.statSyncNoException(filePath)).isFile === "function" ? base1.isFile() : void 0) {
              break;
            }
          }
        }
        return callback(filePath);
      };
    })(this));
  };
}
