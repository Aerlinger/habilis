// const ipcRenderer = global.electron.ipcRenderer

/**
 * Wrap ipcRenderer to use IPython friendly event name formatting:
 */

import { ipcRenderer } from 'electron'


const cid = (function() {
  let i = 0

  return function() {
    return i++
  }
}())

/**
 * @param {Arguments} obj
 * @param {number} [num=0]
 * @returns {Array}
 */
function toArgs(arr, num) {
  return Array.prototype.slice.call(arr, num || 0)
}

/**
 * @param {string} eventName
 * @param {function} eventFn
 * @returns {*}}
 */
export function on(eventName, eventFn) {
  let eventReplyName = eventName + '_reply'

  try {
    ipcRenderer.on(eventName, function(event, eventId, result) {
      let endTime,
          startTime = new Date().getTime()

      let eventResult = eventFn.call(null, event, result)

      endTime = (new Date().getTime() - startTime)

      console.log('ipc: completed', endTime + 'ms', eventName, event, eventResult)

      ipcRenderer.send(eventReplyName, eventId, eventResult)
    })

    console.log('ipc: registered', eventName, eventFn.name)

    return this
  } catch(ex) {
    console.error('ipc: error', eventName, ex)
  }
}

/**
 * @returns {Promise}
 */
export function send() {
  let eventId   = cid().toString()
  let startTime = new Date().getTime()
  let args      = toArgs(arguments)
  let eventName = args[0]

  return new Promise(function(resolve, reject) {
    // noinspection JSDuplicatedDeclaration
    let response
    let eventReplyName = eventName + '_reply'
    let timer          = setInterval(function() {
      console.warn('ipc ' + eventId + ': still waiting for', eventName)
    }, 1000)

    ipcRenderer.send.apply(ipcRenderer, [eventName, eventId].concat(args.slice(1)))

    response = function(event, id) {
      let result, endTime

      if (id === eventId) {
        ipcRenderer.removeListener(eventReplyName, response)
        clearInterval(timer)
        result  = toArgs(arguments).slice(2)
        endTime = (new Date().getTime() - startTime)

        if (result[0]) {
          console.log('ipc ' + eventId + ': error', endTime + 'ms', result[0])
          reject(new Error(result[0].message))
        } else {
          console.log('ipc ' + eventId + ': completed', endTime + 'ms', result[1])
          resolve(result[1])
        }
      } else {
        console.log('ipc ' + eventId + ':', eventName, id, 'is not for us.')
      }
    }

    console.log('ipc ' + eventId + ': waiting for ', eventName, 'on', eventReplyName)
    ipcRenderer.on(eventReplyName, response)
  })
}

