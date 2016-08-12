/**
 * Things related directly to the format of the language interpreters or language
 * @module
 */

'use strict'

import _  from 'lodash'
import fs from 'fs'

/**
 * @param {object} args
 * @returns {object}
 */
export function toPythonArgs(args) {
  return _.reduce(args, function(obj, value, key) {
    obj[_.snakeCase(key)] = value
    // console.log("PYTHON ARGS", obj)

    return obj
  }, {})
}

export function setDefaultEnvVars(env) {
  if (process.platform === 'darwin' && _.isString(env.PATH)) {
    if (_.isString(env.PATH)) {
      const envs = env.PATH.split(':')

      addPath(envs, '/Users/Aerlinger/.pyenv/shims')
      // addPath(envs, '/sbin');
      // addPath(envs, '/usr/sbin');
      // addPath(envs, '/usr/local/bin');

      env.PATH = envs.join(':')
    }
  }

  return _.assign({
    PYTHONUNBUFFERED: '1'
  }, env)
}

function addPath(envs, path) {
  if (!_.includes(envs, path) && fs.existsSync(path)) {
    envs.push(path)
  }
}
