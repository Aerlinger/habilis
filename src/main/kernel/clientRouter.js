'use strict'

import _ from 'lodash'
import StreamSplitter from 'stream-splitter'
import EventEmitter   from 'events'

import { asInternal } from '../utils/log'
const log = asInternal(__filename)

let outputMap = {}

/**
 * Sets up event handlers to process stdout messages from remote kernels
 *
 * @param client
 * @param child
 */
export function dispatchEvents(client) {
  let child = client.parentProcess.process

  // TODO: Use promises instead of events
  const objectEmitter = createObjectEmitter(child.stdout)

  objectEmitter.on('data', _.partial(handle, client))
  objectEmitter.on('error', _.partial(handleProcessStreamEvent, client, 'objectEmitter.error'))
  objectEmitter.on('end', _.partial(handleProcessStreamEvent, client, 'objectEmitter.end'))

  child.stdout.on('error', _.partial(handleProcessStreamEvent, client, 'stdout.error'))
  child.stderr.on('data', _.partial(handleProcessStreamEvent, client, 'stderr.data'))
  child.stderr.on('error', _.partial(handleProcessStreamEvent, client, 'stderr.error'))

  child.on('error', _.partial(handleProcessStreamEvent, client, 'error'))
}

/**
 * @param {JupyterClient} client
 * @param {string} source
 * @param {object} data
 */
function handleProcessStreamEvent(client, source, data) {
  // log('info', 'PROCESS STREAM EVENT', source, data)

  client.emit('event', source, data)
}

/**
 * Listen to JSON stream, emitting once a parseable JSON object has been received
 *
 * @param stream
 * @returns {EventEmitter}
 */
function createObjectEmitter(stream) {
  const emitter = new EventEmitter()

  stream          = stream.pipe(new StreamSplitter('\n'))
  stream.encoding = 'utf8'

  stream.on('token', function(token) {
    try {
      emitter.emit('data', JSON.parse(token)) // FIXME: Performance issues here?
    } catch(ex) {
      log('error', require('util').inspect(token), ex) // we don't have enough data yet, maybe?
    }
  })

  stream.on('error', error => emitter.emit('error', error))

  return emitter
}

/**
 * @param {JupyterClient} client
 * @param {JupyterClientResponse} response
 */
function handle(client, response) {
  if (isStartComplete(response)) {
    // log('info', "STARTUP COMPLETE", response)
    client.emit('ready')
  }

  else if (isRequestToOutputLink(client, response))
    linkRequestToOutput(client, response)

  else if (isExecutionResult(response))
    resolveExecutionResult(client, response)

  else if (isEvalResult(response))
    resolveEvalResult(client, response)

  else if (response.result && response.source) {
    console.log("HANDLE RESPONSE RESULT/SOURCE:", response.source, response.result)
    client.emit(response.source, response)
  }

  else if (response.id && response.result === null) {
  }
  // ignore, they didn't give us a msg_id and that's okay

  else
    client.emit('error', new Error('Unknown data object: ' + require('util').inspect(response)))
}

/**
 * @param {JupyterClient} client
 * @param {JupyterClientResponse} response
 * @returns {boolean}
 */
function isRequestToOutputLink(client, response) {
  return !!(response.source === 'link' && response.id && response.result && client.requestMap[response.id])
}

/**
 *
 * @param {JupyterClient} client
 * @param {JupyterClientResponse} response
 */
function linkRequestToOutput(client, response) {
  if (!_.isString(response.result))
    throw new Error('Expected result to be msg_id of a later response')

  if (!_.isString(response.id))
    throw new Error('Expected id to be a key referring to an earlier request')

  // log('info', "LINK REQ TO OUTPUT", response)

  let requestMap = client.requestMap

  requestMap[response.id].msg_id = response.result
  outputMap[response.result]     = {
    id:     response.id,
    msg_id: response.result
  }
}

/**
 * @param {JupyterClientResponse} response
 * @returns {boolean}
 */
function isExecutionResult(response) {
  const parentMessageId = _.get(response, 'result.parent_header.msg_id')
  const msg_type        = _.get(response, 'result.msg_type')
  const isReply         = msg_type && _.endsWith(msg_type, '_reply')

  if (_.size(outputMap) === 0 && isReply)
    log('warn', msg_type, 'without anyone waiting for output', outputMap, response)
  else if (isReply && !!outputMap[parentMessageId])
    log('warn', msg_type, 'without parent waiting for output', outputMap, response)

  return !!outputMap[parentMessageId]
}

/**
 *
 * @param {JupyterClient} client
 * @param {JupyterClientResponse} response
 */
function resolveExecutionResult(client, response) {
  // log('info', "RESOLVE EXECUTION RESULT: ", response)

  const result      = response.result
  const outputMapId = _.get(result, 'parent_header.msg_id')

  let parent    = outputMap[outputMapId]
  let child     = _.omit(result, ['msg_id', 'parent_header'])
  let requestId = parent.id
  let request   = client.requestMap[requestId]

  child.header = _.omit(child.header, ['version', 'msg_id', 'session', 'username', 'msg_type'])

  if (!parent.header)
    parent.header = result.parent_header

  if (isInputRequestMessage(response.source, child))
    requestInputFromUser(client, result)

  else if (isRequestResolution(parent, child, client))
    resolveRequest(request, result)

  else if (child.msg_type === 'status')
    broadcastKernelStatus(client, result)

  if (!request.hidden) {
    console.log("RESOLVE EXECUTION RESULT", response.source, response)
    client.emit(response.source, response)
  }
}

/**
 * @param {object} request
 * @param {object} result
 */

/*
function resolveRequest(request, result) {
  // payload is deprecated, so don't even expose it
  request.deferred.resolve(_.omit(result.content, 'payload', 'engine_info', 'execution_count'))

  // we're done reporting about this topic
  delete outputMap[request.msg_id]
}
*/

/**
 * @param {JupyterClientResponse} response
 * @returns {boolean}
 */
function isEvalResult(response) {
  return response.source === 'eval' && _.isString(response.id)
}

/**
 *
 * @param {JupyterClient} client
 * @param {JupyterClientResponse} response
 */
function resolveEvalResult(client, response) {
  // log('info', "RESOLVE EVAL RESULT: ", response)

  const request = client.requestMap[response.id]

  // payload is deprecated, so don't even expose it
  request.deferred.resolve(response.result)
}

/**
 * @param {string} source
 * @param {{msg_type: string}} child
 * @returns {boolean}
 */
function isInputRequestMessage(source, child) {
  return source === 'stdin' && child.msg_type === 'input_request'
}

/**
 * @param {JupyterClient} client
 * @param {*} message
 */
function requestInputFromUser(client, message) {
  // log('info', "REQUSTING INPUT FROM USR: ", message)
  client.emit('input_request', message)
}

function broadcastKernelStatus(client, message) {
  // log('info', "BROADCAST KERNEL STATUS ", message)
  client.emit('status', message.content.execution_state)
}

/**
 * @param {{id: string}} parent  Original request
 * @param {{msg_type: string}} child  Resulting action
 * @param {JupyterClient} client  Map of all current requests
 * @returns {boolean}
 */
function isRequestResolution(parent, child, client) {
  const requestMap = client.requestMap
  let request      = requestMap[parent.id]

  if (request) {
    if (_.isArray(request.successEvent) && _.includes(request.successEvent, child.msg_type))
      return true
    else if (request.successEvent === child.msg_type)
      return true

  }

  return false
}

/**
 * @param {object} request
 * @param {object} result
 */
function resolveRequest(request, result) {
  // payload is deprecated, so don't even expose it
  request.deferred.resolve(_.omit(result.content, 'payload', 'engine_info', 'execution_count'))

  // we're done reporting about this topic
  delete outputMap[request.msg_id]
}

/**
 * @param {{status: string, id: string}} obj
 * @returns {boolean}
 */
function isStartComplete(obj) {
  return obj.status === 'complete' && obj.id === 'startup-complete'
}

/**
 * @returns {object}
 */

/*
function getOutputMap() {
  // outside people are not allowed to modify this
  return _.cloneDeep(outputMap)
}
*/

/*
function resetOutputMap() {
  outputMap = {}
}
*/

