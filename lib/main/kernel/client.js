import path from 'path'
import _ from 'lodash'
import bluebird from 'bluebird'
import { EventEmitter } from 'events'
import uuid from 'uuid'

import { asInternal } from '../utils/log'
import * as clientRouter from './clientRouter'
import * as pythonLanguage from '../languages/python'
import { JupyterProcess } from './process'

const log = asInternal(__filename)
const clientMap = {}

export clientMap


/**
 * @class JupyterClient
 */
export class JupyterClient extends EventEmitter {

  constructor() {
    super()

    this.childProcess = new JupyterProcess(this)
    this.requestMap   = {}

    this.clientMap[this.childProcess.childProcess.pid] = this

    clientRouter.dispatchEvents(this, this.childProcess.childProcess)
  }

  /*
   * @param {object} invocation
   * @param {string} invocation.method
   * @param {Array} [invocation.args]
   * @param {object} [invocation.kwargs]
   * @param {string} [invocation.target]
   * @param {object} options
   * @param {string|string[]} options.successEvent
   * @returns {Promise}
   */
  request(invocation, options) {
    const id     = uuid.v4().toString()
    const reqObj = _.assign({ id }, invocation)

    const inputPromise = this.childProcess.write(reqObj)
    const startTime    = new Date().getTime()

    const outputPromise = new Promise((resolve, reject) => {
      this.requestMap[id] = { id, ...options, invocation, deferred: { resolve, reject } }
    })

    return inputPromise
      .then(() => outputPromise)
      .finally(() => {
        const endTime = (new Date().getTime() - startTime) + 'ms'

        log('info', 'SENT REQ:', reqObj, endTime)

        // clean up reference, no matter what the result
        delete this.requestMap[id]
      })
  }

  /**
   * @param {object} [options]
   * @returns {object}
   */
  getPythonCommandOptions(options) {
    options = resolveHomeDirectory(options)

    return _.assign({
      env:      pythonLanguage.setDefaultEnvVars(process.env),
      stdio:    ['pipe', 'pipe', 'pipe'],
      encoding: 'UTF8'
    }, _.pick(options || {}, ['shell']))
  }

  createPythonScriptProcess(targetFile, options) {
    options = _.pick(options || {}, ['shell', 'cmd'])

    const processOptions = getPythonCommandOptions(options)
    const cmd            = options.cmd || 'python'

    return processes.create(cmd, [targetFile], processOptions)
  }


  getPythonScriptResults(targetFile, options = {}) {
    const processOptions = getPythonCommandOptions(options)
    const cmd            = options.cmd || 'python'

    return processes.exec(cmd, [targetFile], processOptions)
  }

  /**
   * @param {object} options
   * @returns {object}  Modified options
   */
  resolveHomeDirectory(options) {
    if (options && options.cmd && (_.startsWith(options.cmd, '~') || _.startsWith(options.cmd, '%HOME%'))) {
      const home = require('os').homedir()

      options.cmd = options.cmd.replace(/^~/, home).replace(/^%HOME%/, home)
    }

    return options
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
    return this.request({
      method: 'execute',
      kwargs: _.assign({ code }, pythonLanguage.toPythonArgs(args))
    }, { successEvent: 'execute_reply' })
  }

  /**
   * Respond to a request for input from the kernel
   * @param {string} str
   * @returns {Promise}
   */
  input(str) {
    return this.request({ method: 'input', args: [str] }, { successEvent: 'execute_reply' })
  }

  interrupt() {
    const id     = uuid.v4().toString()
    const target = 'manager'
    const method = 'interrupt_kernel'

    return this.childProcess.write({ method, target, id })
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
    return this.request({
      method: 'execute',
      kwargs: _.assign({ code }, pythonLanguage.toPythonArgs(args))
    }, {
      successEvent: ['execute_result', 'display_data', 'stream'],
      emitOnly:     []
    })
  }

  /**
   * @param {string} str
   * @returns {Promise}
   */
  getEval(str) {
    return this.request({
      exec_eval: str
    }, { successEvent: ['eval_results'] })
  }

  getDocStrings(names) {
    const code = '__get_docstrings(globals(), ' + JSON.stringify(names) + ', False)'
    const args = {
      allowStdin:  false,
      stopOnError: true
    }

    return this.request({
      method: 'execute',
      kwargs: _.assign({ code }, pythonLanguage.toPythonArgs(args))
    }, {
      successEvent: ['stream'],
      hidden:       true
    })
  }

  getVariables() {
    const code = '__get_variables(globals())'
    const args = {
      allowStdin:  false,
      stopOnError: true
    }

    return this.request({
      method: 'execute',
      kwargs: _.assign({ code }, pythonLanguage.toPythonArgs(args))
    }, {
      successEvent: ['stream'],
      hidden:       true
    }).then(function(result) {
      return JSON.parse(result.text)
    })
  }

  /**
   * We send msg_type: complete_request
   * We get msg_type: complete_reply with content of
   *   {status: ok|error, matches: Array, cursorStart: number, cursorEnd: number, metadata: map}
   * @param {string} code
   * @param {number} cursorPos
   *
   * @returns {Promise<JupyterAutoCompletionMessage>}
   *
   * @typedef {object} JupyterAutoCompletionMessage
   * @property {'ok'|'error'} status
   * @property {Array} matches
   * @property {number} cursorStart
   * @property {number} cursorEnd
   * @property {object} metadata
   */
  getAutoComplete(code, cursorPos) {
    return this.request({
      method: 'complete', // sends complete_request
      args:   [code, cursorPos]
    }, { successEvent: 'complete_reply' })
  }

  /**
   * @param {string} code
   * @param {number} cursorPos
   * @param {number} [detailLevel=0]  Equivalent in python would be 0 is x?, 1 is x??
   *
   * @returns {Promise<JupyterInspectionMessage>}
   *
   * @typedef {object} JupyterInspectionMessage
   * @property {'ok'|'error'} status
   * @property {bool} found
   * @property {object} data
   * @property {object} metadata
   */
  getInspection(code, cursorPos, detailLevel) {
    detailLevel = detailLevel || 0

    return this.request({
      method: 'inspect', // sends inspect_request
      args:   [code, cursorPos, detailLevel]
    }, { successEvent: 'inspect_reply' })
  }

  /**
   * Is code likely to run successfully?
   *
   * @param {string} code
   * @returns {Promise<JupyterCodeIsCompleteMessage>}
   *
   * @typedef {object} JupyterCodeIsCompleteMessage
   * @property {'complete'|'incomplete'|'invalid'|'unknown'} status
   * @property {string} indent  Only for incomplete status
   */
  isComplete(code) {
    return this.request({
      method: 'is_complete', // sends is_complete_request
      args:   [code]
    }, { successEvent: 'is_complete_reply' })
  }

  /**
   * @returns {Promise}
   */
  kill() {
    return this.childProcess.kill()
  }

  getChildProcess() {
    return this.childProcess
  }
}
