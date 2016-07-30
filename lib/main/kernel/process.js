import path from 'path'
import ChildProcess from 'child_process'
import bluebird from 'bluebird'
import _ from 'lodash'

import { asInternal } from '../utils/log'

const log = asInternal(__filename)

const childProcesses = []
const processMap     = {}


/**
 * @param {ChildProcess} child
 */
function addChild(child) {
  childProcesses.push(child)
  log('debug', 'added child process', child.pid, ';', childProcesses.length, 'children running')
}

/**
 * @param {ChildProcess} child
 */
function removeChild(child) {
  _.pull(childProcesses, child)
  log('debug', 'removed child process', child.pid, ';', childProcesses.length, 'children running')
}

/**
 * @param {string} str
 * @param {Array} [args]
 * @param {object} [options]
 * @returns {ChildProcess}
 */
function create(str, args, options) {
  let childProcess = ChildProcess
    .spawn(str, args || options, args && options)
    .on('close', () => removeChild(childProcess))

  addChild(childProcess)

  return childProcess
}

/**

 * Events:
 * - onData
 * - onSpawnCompleted
 * - onClose
 * - onHeartbeatSuccess
 * - onHeartbeatFail
 */
export class JupyterProcess {
  constructor(parentClient, options) {
    this.parentClient = parentClient

    const kernelStartupFile = path.resolve(path.join(__dirname, '..', '..', 'kernels', 'python', 'bin', 'start_kernel.py'))
    this.childProcess = create("python", [kernelStartupFile], options)
  }

  /**
   * @param {object} options
   * @returns {Promise<JupyterClient>}
   */
  write(obj) {
    return new bluebird((resolve, reject) => {
      let payload = JSON.stringify(obj) + '\n'

      let result = this.childProcess.stdin.write(payload, function(error) {
        if (!result)
          reject(new Error('Unable to write to stdin'))
        else if (error)
          reject(error)
        else
          resolve()
      })
    })
  }

  /**
   * @param {string} str
   * @param {Array} [args]
   * @param {object} [options]
   * @returns {Promise}
   */
  exec(str, args, options) {
    return new bluebird((resolve, reject) => {
      let stdout = []
      let stderr = []
      let errors = []

      this.childProcess.stdout.on('data', data => stdout.push(data))
      this.childProcess.stderr.on('data', data => stderr.push(data))

      this.childProcess.on('error', data => errors.push(data))
      this.childProcess.on('close', function() {
        if (errors.length)
          reject(_.first(errors))
        else if (stderr.length)
          reject(new Error(stderr.join('')))
        else
          resolve(stdout.join(''))
      })
    })
  }

  /**
   * @param {ChildProcess}childProcess
   * @returns {Promise}
   */
  kill() {
    return new bluebird((resolve) => {
      this.childProcess.on('close', function(code, signal) {
        resolve({ code, signal })
      })

      this.childProcess.kill()

    }).timeout(5000, 'failed to kill child process ' + this.childProcess.pid)
  }
}
