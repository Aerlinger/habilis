/**
 * todo: Somehow we need to convert this all to client-side
 */

'use strict';

const _ = require('lodash')
const bluebird = require('bluebird')
const files = require('./files')
const jsYaml = require('js-yaml')
const path = require('path')
const util = require('util')
// dialogs = require('dialogs')({url: '../../static/img/cowboy-hat.svg'}),

/**
 * @param {EventEmitter} ipcEmitter
 * @param {object} definition
 * @returns {Array}
 */
function convertMenu(ipcEmitter, definition) {
  return _.map(definition, function (itemDefinition) {
    const clickAction = itemDefinition.click,
          clickActionType = clickAction && clickAction.type,
          submenu = itemDefinition.submenu,
          item = _.pickBy(itemDefinition, _.isString) // clone all strings

    if (_.isArray(submenu)) {
      item.submenu = convertMenu(ipcEmitter, submenu)
    } else if (submenu) {
      throw new Error('Bad menu configuration: ' + util.inspect(itemDefinition))
    }

    if (_.isString(clickActionType)) {
      item.click = ipcEmitter.send.bind(ipcEmitter, 'dispatch', clickAction)
    }

    return item
  })
}

/**
 * @param {electron.ipcMain} ipcEmitter
 * @param {object} definition
 * @returns {Array}
 */
export function toElectronMenuTemplate(ipcEmitter, definition) {
  return bluebird.try(function () {
    return convertMenu(ipcEmitter, definition)
  })
}

export function getByName(name) {
  return files.readFile(path.resolve(__dirname, '..', 'menus', name + '.yml'))
              .then(jsYaml.safeLoad)
}

// let menu = Menu.buildFromTemplate(getMenuShortcutsTemplate()),
//   fileMenu = Menu.buildFromTemplate(getFileMenuTemplate()),
//   folderMenu = Menu.buildFromTemplate(getFolderMenuTemplate())
