'use strict';

import _  from 'lodash'
import chalk from 'chalk'
import path from'path'
import winston from 'winston'
import util from 'util'

// const electronWinstonTransport = require('./electron-winston-transport');
// winston.transports.ElectronLogger = electronWinstonTransport;

let logLevel = process.env.RODEO_LOG_LEVEL || 'info';

let transports = [
  new winston.transports.Console({
    level:                           logLevel,
    colorize:                        true,
    humanReadableUnhandledException: true
  }),

  new winston.transports.File({
    filename:    path.join(require('os').homedir(), 'rodeo.log'),
    level:       logLevel,
    maxFiles:    2,
    maxsize:     1024 * 1024,
    tailable:    true,
    json:        false,
    colorize:    false,
    prettyPrint: true
  })
];

let logger = new winston.Logger({
  transports:  transports,
  exitOnError: false
});

winston.handleExceptions(transports);

/**
 * @param {*} obj
 * @returns {boolean}
 */
function _isError(obj) {
  return _.isError(obj) || (_.isObject(obj) && obj.stack && _.endsWith(obj.name, 'Error'));
}

function _isEventEmitter(obj) {
  return _.isObject(obj) && _.isFunction(obj.on);
}

function _isBluebirdPromise(obj) {
  return _.isFunction(obj.then) && _.isFunction(obj.reflect);
}

function _isBluebirdPromiseInspection(obj) {
  return _.isFunction(obj.isPending) &&
    _.isFunction(obj.isRejected) &&
    _.isFunction(obj.isFulfilled) &&
    _.isFunction(obj.isCancelled);
}

function _transformBluebirdPromise(obj) {
  const fake = {};

  fake.inspect = function() {
    const state = {
      pending:   obj.isPending(),
      rejected:  obj.isRejected(),
      fulfilled: obj.isFulfilled(),
      cancelled: obj.isCancelled()
    };

    if (state.fulfilled) {
      state.value = obj.value();
    } else if (state.rejected) {
      state.reason = obj.reason();
    }

    return 'Bluebird Promise ' + _printObject(state);
  };

  return fake;
}

function _isElectronEvent(obj) {
  return _.isObject(obj) && _.isFunction(obj.preventDefault) && !!obj.sender;
}

function _transformElectronEvent(obj) {
  const fake = {};

  fake.inspect = function() {
    return 'ElectronEvent ' + _printObject({ sender: obj.sender });
  };

  return fake;
}

function _transformEventEmitter(obj) {
  const fake = {};

  fake.inspect = function() {
    return 'EventEmitter ' + _printObject({
        events: _.pickBy(obj._events, function(value, key) {
          return !_.startsWith(key, 'ATOM');
        })
      });
  };

  return fake;
}

function _printObject(obj) {
  return util.inspect(obj, { depth: 10, colors: true });
}

function _sanitizeObject(value) {
  if (_.isObject(value)) {
    if (_isBluebirdPromise(value) || _isBluebirdPromiseInspection(value)) {
      return _transformBluebirdPromise(value);
    } else if (_.isBuffer(value)) {
      return value.toString();
    } else if (_isError(value)) {
      return value.stack;
    } else if (_isElectronEvent(value)) {
      return _transformElectronEvent(value);
    } else if (_isEventEmitter(value)) {
      return _transformEventEmitter(value);
    } else {
      return _.mapValues(value, _sanitizeObject);
    }
  } else {
    return value;
  }
}

/**
 * Standard format for internal logging (non-streaming/non-kernel)
 * @param {string} dirname
 * @returns {Function}
 */
export function asInternal(dirname) {
  const prefix = path.relative(process.cwd(), dirname).replace(/\.js$/, '').replace(/^[\.]\.\//, '');

  return function(type) {
    exports.log(type, _.reduce(_.slice(arguments, 1), function(list, value) {
      if (_.isObject(value)) {
        list.push(_printObject(_sanitizeObject(value)));
      } else {
        list.push(value + '');
      }

      return list;
    }, [chalk.blue(prefix + '::')]).join(' '));
  };
}

export function log() {
  logger.log.apply(logger, _.slice(arguments));
};
