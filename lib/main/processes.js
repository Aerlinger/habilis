import bluebird from 'bluebird'
import childProcess from 'child_process'
import _ from 'lodash'
const children = [];
const log      = console.log;

/**
 * @param {string} str
 * @param {Array} [args]
 * @param {object} [options]
 * @returns {ChildProcess}
 */
export function create(str, args, options) {
  const child = childProcess.spawn(str, args || options, args && options)
  // .on('close', () => removeChild(child));

  _addChild(child);
  return child;
}

export function getChildren() {
  return children;
}

/**
 * @param {ChildProcess}childProcess
 * @returns {Promise}
 */
export function kill(childProcess) {
  return new bluebird(function(resolve) {
    childProcess.on('close', function(code, signal) {
      resolve({ code, signal });
    });

    childProcess.kill();

  }).timeout(5000, 'failed to kill child process ' + childProcess.pid);
}

/**
 * @param {ChildProcess} child
 */
function _addChild(child) {
  children.push(child);
  log('debug', 'added child process', child.pid, ';', children.length, 'children running');
}

/**
 * @param {ChildProcess} child
 */
function removeChild(child) {
  _.pull(children, child);
  log('debug', 'removed child process', child.pid, ';', children.length, 'children running');
}

/**
 * @param {string} str
 * @param {Array} [args]
 * @param {object} [options]
 * @returns {Promise}
 */
export function exec(str, args, options) {
  return new bluebird(function (resolve, reject) {
    const child = create(str, args, options);
    let stdout = [],
          stderr = [],
          errors = [];

    child.stdout.on('data', data => stdout.push(data));
    child.stderr.on('data', data => stderr.push(data));
    
    child.on('error', data => errors.push(data));
    
    child.on('close', function () {
      if (errors.length) {
        reject(_.first(errors));
      } else if (stderr.length) {
        reject(new Error(stderr.join('')));
      } else {
        resolve(stdout.join(''));
      }
    });
  });
}
