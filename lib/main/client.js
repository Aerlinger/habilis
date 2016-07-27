const _            = require('lodash')
const bluebird     = require('bluebird')
const clientRouter = require('./clientRouter')
const EventEmitter = require('events')

// const log            = require('../services/log').asInternal(__filename)
const log  = console.log
const path = require('path')

const pythonLanguage = require('./languages/python')

// const processes      = require('../services/processes')
// const promises       = require('../services/promises')
import uuid from 'uuid'

import { toPythonArgs, setDefaultEnvVars } from './utils/python'
import * as processes from './processes'


// let requestMap = {}


/**
 * @param {object} options
 * @returns {Promise<JupyterClient>}
 */

/*
 function create(options) {
 const targetFile = path.resolve('./bin/start_kernel.py');

 return bluebird.try(function() {
 const child  = createPythonScriptProcess(targetFile, options)
 const client = new JupyterClient(child);

 return promises.eventsToPromise(client, { resolve: 'ready', reject: 'error' })
 .then(_.constant(client));
 });
 }
 */

/*
 * @param {JupyterClient} client
 * @param {object} invocation
 * @param {string} invocation.method
 * @param {Array} [invocation.args]
 * @param {object} [invocation.kwargs]
 * @param {string} [invocation.target]
 * @param {object} options
 * @param {string|string[]} options.successEvent
 * @returns {Promise}
 */
function request(client, invocation, options) {
  const childProcess  = client.childProcess,
        requestMap    = client.requestMap,
        id            = uuid.v4().toString(),
        inputPromise  = write(childProcess, _.assign({ id }, invocation)),
        successEvent  = options.successEvent,
        hidden        = options.hidden,
        startTime     = new Date().getTime(),
        outputPromise = new Promise(function(resolve, reject) {
          requestMap[id] = { id, invocation, successEvent, hidden, deferred: { resolve, reject } };
        });

  return inputPromise
    .then(() => outputPromise)
    
    .finally(function() {
      const endTime = (new Date().getTime() - startTime) + 'ms';

      log('info', 'request', invocation, endTime);

      // clean up reference, no matter what the result
      delete requestMap[id];
    });
}


/**
 * @param {object} options
 * @returns {object}  Modified options
 */
function _resolveHomeDirectory(options) {
  if (options && options.cmd && (_.startsWith(options.cmd, '~') || _.startsWith(options.cmd, '%HOME%'))) {
    const home = require('os').homedir();

    options.cmd = options.cmd.replace(/^~/, home).replace(/^%HOME%/, home);
  }

  return options;
}

/**
 * @param {object} [options]
 * @returns {object}
 */
function _getPythonCommandOptions(options) {
  options = _resolveHomeDirectory(options);

  return _.assign({
    env:      pythonLanguage.setDefaultEnvVars(process.env),
    stdio:    ['pipe', 'pipe', 'pipe'],
    encoding: 'UTF8'
  }, _.pick(options || {}, ['shell']));
}

export function createPythonScriptProcess(targetFile, options) {
  options = _.pick(options || {}, ['shell', 'cmd']);

  const processOptions = getPythonCommandOptions(options),
        cmd            = options.cmd || 'python';

  return processes.create(cmd, [targetFile], processOptions);
}

function getPythonScriptResults(targetFile, options = {}) {
  const processOptions = _getPythonCommandOptions(options),
        cmd            = options.cmd || 'python';

  return processes.exec(cmd, [targetFile], processOptions);
}

function write(childProcess, obj) {
  console.log("WRITE: ", obj)

  return new bluebird(function(resolve, reject) {
    console.log("Resolving...")
    console.log(JSON.stringify(obj) + '\n')

    let result = childProcess.stdin.write(JSON.stringify(obj) + '\n', function(error) {

      console.log("WRITE RESULT:", result)

      if (!result) {
        reject(new Error('Unable to write to stdin'));
      } else if (error) {
        console.error("Rejecting...")
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

/**
 * @class JupyterClient
 */
export class JupyterClient extends EventEmitter {
  constructor(child) {
    super()

    this.childProcess = child
    this.requestMap   = {}

    clientRouter.dispatchEvents(this, child)
    // listenToChild(this, child)
  }

  /**
   * @param {string} code
   * @param {object} [args]
   * @param {boolean} [args.silent]
   * @param {boolean} [args.storeHistory]
   * @param {object} [args.userExpressions]
   * @param {boolean} [args.allowStdin]
   * @param {boolean} [args.stopOnError]
   * @returns {Promise<object>}
   */
  execute(code, args) {
    return request(this, {
      method: 'execute',
      kwargs: _.assign({ code }, pythonLanguage.toPythonArgs(args))
    }, { successEvent: 'execute_reply' });
  }

  /**
   * Respond to a request for input from the kernel
   * @param {string} str
   * @returns {Promise}
   */
  input(str) {
    return request(this, { method: 'input', args: [str] }, { successEvent: 'execute_reply' });
  }

  interrupt() {
    const id     = uuid.v4().toString()
    const target = 'manager'
    const method = 'interrupt_kernel'

    return write(this.childProcess, { method, target, id });
  }

  /**
   * @param {string} code
   * @param {object} [args]
   * @param {boolean} [args.silent]
   * @param {boolean} [args.storeHistory]
   * @param {object} [args.userExpressions]
   * @param {boolean} [args.allowStdin]
   * @param {boolean} [args.stopOnError]
   * @returns {Promise<object>}
   */
  getResult(code, args) {
    return request(this, {
      method: 'execute',
      kwargs: _.assign({ code }, pythonLanguage.toPythonArgs(args))
    }, {
      successEvent: ['execute_result', 'display_data', 'stream'],
      emitOnly:     []
    });
  }

  /**
   * @param {string} str
   * @returns {Promise}
   */
  getEval(str) {
    return request(this, {
      exec_eval: str
    }, { successEvent: ['eval_results'] });
  }

  getDocStrings(names) {
    const code = '__get_docstrings(globals(), ' + JSON.stringify(names) + ', False)'
    const args = {
      allowStdin:  false,
      stopOnError: true
    };

    return request(this, {
      method: 'execute',
      kwargs: _.assign({ code }, pythonLanguage.toPythonArgs(args))
    }, {
      successEvent: ['stream'],
      hidden:       true
    });
  }

  getVariables() {
    const code = '__get_variables(globals())',
          args = {
            allowStdin:  false,
            stopOnError: true
          };

    return request(this, {
      method: 'execute',
      kwargs: _.assign({ code }, pythonLanguage.toPythonArgs(args))
    }, {
      successEvent: ['stream'],
      hidden:       true
    }).then(function(result) {
      return JSON.parse(result.text);
    });
  }

  /**
   * @typedef {object} JupyterAutoCompletionMessage
   * @property {'ok'|'error'} status
   * @property {Array} matches
   * @property {number} cursorStart
   * @property {number} cursorEnd
   * @property {object} metadata
   */

  /**
   *
   *
   * We send msg_type: complete_request
   * We get msg_type: complete_reply with content of
   *   {status: ok|error, matches: Array, cursorStart: number, cursorEnd: number, metadata: map}
   * @param {string} code
   * @param {number} cursorPos
   * @returns {Promise<JupyterAutoCompletionMessage>}
   */
  getAutoComplete(code, cursorPos) {
    return request(this, {
      method: 'complete', // sends complete_request
      args:   [code, cursorPos]
    }, { successEvent: 'complete_reply' });
  }

  /**
   * @typedef {object} JupyterInspectionMessage
   * @property {'ok'|'error'} status
   * @property {bool} found
   * @property {object} data
   * @property {object} metadata
   */

  /**
   * @param {string} code
   * @param {number} cursorPos
   * @param {number} [detailLevel=0]  Equivalent in python would be 0 is x?, 1 is x??
   * @returns {Promise<JupyterInspectionMessage>}
   */
  getInspection(code, cursorPos, detailLevel) {
    detailLevel = detailLevel || 0;

    return request(this, {
      method: 'inspect', // sends inspect_request
      args:   [code, cursorPos, detailLevel]
    }, { successEvent: 'inspect_reply' });
  }

  /**
   * @typedef {object} JupyterCodeIsCompleteMessage
   * @property {'complete'|'incomplete'|'invalid'|'unknown'} status
   * @property {string} indent  Only for incomplete status
   */

  /**
   * Is code likely to run successfully?
   *
   * @param {string} code
   * @returns {Promise<JupyterCodeIsCompleteMessage>}
   */
  isComplete(code) {
    return request(this, {
      method: 'is_complete', // sends is_complete_request
      args:   [code]
    }, { successEvent: 'is_complete_reply' });
  }

  /**
   * @returns {Promise}
   */
  kill() {
    return processes.kill(this.childProcess);
  }
}
