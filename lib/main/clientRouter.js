'use strict';

const _       = require('lodash');
const log     = require('./utils/log').asInternal(__filename);
const StreamSplitter = require('stream-splitter')
const EventEmitter   = require('events')

let outputMap = {};

/**
 * @param {JupyterClient} client
 * @param {JupyterClientResponse} response
 */
function handle(client, response) {
  console.log("!!! RECEIVED DATA !!!", response)

  if (isStartComplete(response))
    client.emit('ready');

  else if (isRequestToOutputLink(client, response))
    linkRequestToOutput(client, response);

  else if (isExecutionResult(response))
    resolveExecutionResult(client, response);

  else if (isEvalResult(response))
    resolveEvalResult(client, response);

  else if (response.result && response.source)
    client.emit(response.source, response);

  else if (response.id && response.result === null) {}
  // ignore, they didn't give us a msg_id and that's okay

  else
    client.emit('error', new Error('Unknown data object: ' + require('util').inspect(response)));
}


export function dispatchEvents(client, child) {
  const objectEmitter = createObjectEmitter(child.stdout);

  objectEmitter.on('data', _.partial(handle, client));
  objectEmitter.on('error', _.partial(handleProcessStreamEvent, client, 'objectEmitter.error'));
  objectEmitter.on('end', _.partial(handleProcessStreamEvent, client, 'objectEmitter.end'));

  child.stdout.on('error', _.partial(handleProcessStreamEvent, client, 'stdout.error'));
  child.stderr.on('data', _.partial(handleProcessStreamEvent, client, 'stderr.data'));
  child.stderr.on('error', _.partial(handleProcessStreamEvent, client, 'stderr.error'));

  child.on(       'error', _.partial(handleProcessStreamEvent, client, 'error'));
}



/**
 *
 * @param {JupyterClient} client
 * @param {JupyterClientResponse} response
 */
function linkRequestToOutput(client, response) {
  let requestMap = client.requestMap

  if (!_.isString(response.result)) {
    throw new Error('Expected result to be msg_id of a later response');
  }

  if (!_.isString(response.id)) {
    throw new Error('Expected id to be a key referring to an earlier request');
  }

  requestMap[response.id].msg_id = response.result;
  outputMap[response.result]     = { id: response.id, msg_id: response.result };
}

/**
 * @param {string} source
 * @param {{msg_type: string}} child
 * @returns {boolean}
 */
function isInputRequestMessage(source, child) {
  return source === 'stdin' && child.msg_type === 'input_request';
}

/**
 * Listen to JSON stream, emitting once a parseable JSON object has been received
 *
 * @param stream
 * @returns {EventEmitter}
 */
function createObjectEmitter(stream) {
  const streamSplitter = new StreamSplitter('\n');
  const emitter        = new EventEmitter();

  stream          = stream.pipe(streamSplitter);
  stream.encoding = 'utf8';
  stream.on('token', function(token) {
    console.log("TOKEN: ", token)

    let obj;

    try {
      obj = JSON.parse(token);  // FIXME: Performance issues here?

      emitter.emit('data', obj);
    } catch(ex) {
      log('error', require('util').inspect(token), ex);
      // we don't have enough data yet, maybe?
    }
  });

  stream.on('error', error => emitter.emit('error', error));

  return emitter;
}

/**
 *
 * @param {JupyterClient} client
 * @param {JupyterClientResponse} response
 */
function resolveEvalResult(client, response) {
  const result  = response.result,
        request = client.requestMap[response.id];

  // payload is deprecated, so don't even expose it
  request.deferred.resolve(result);
}

/**
 *
 * @param {JupyterClient} client
 * @param {JupyterClientResponse} response
 */
function resolveExecutionResult(client, response) {
  const source      = response.source,
        result      = response.result,
        outputMapId = _.get(result, 'parent_header.msg_id');

  let parent    = outputMap[outputMapId],
      child     = _.omit(result, ['msg_id', 'parent_header']),
      requestId = parent.id,
      request   = client.requestMap[requestId];

  child.header = _.omit(child.header, ['version', 'msg_id', 'session', 'username', 'msg_type']);
  if (!parent.header) {
    parent.header = result.parent_header;
  }

  if (isInputRequestMessage(source, child)) {
    requestInputFromUser(client, result);
  } else if (isRequestResolution(parent, child, client)) {
    resolveRequest(request, result);


  } else if (child.msg_type === 'status') {
    broadcastKernelStatus(client, result);
  }

  if (!request.hidden) {
    client.emit(response.source, response);
  }
}

/**
 * @param {JupyterClient} client
 * @param {string} source
 * @param {object} data
 */
function handleProcessStreamEvent(client, source, data) {
  log('info', 'client event', source, data);

  client.emit('event', source, data);
}

/**
 * @param {JupyterClient} client
 * @param {JupyterClientResponse} response
 * @returns {boolean}
 */
function isRequestToOutputLink(client, response) {
  const requestMap = client.requestMap,
        result     = response.result,
        source     = response.source;

  return !!(source === 'link' && response.id && result && requestMap[response.id]);
}

/**
 * @param {JupyterClientResponse} response
 * @returns {boolean}
 */
function isExecutionResult(response) {
  const parentMessageId = _.get(response, 'result.parent_header.msg_id'),
        msg_type        = _.get(response, 'result.msg_type'),
        isReply         = msg_type && _.endsWith(msg_type, '_reply');

  if (_.size(outputMap) === 0 && isReply) {
    log('warn', msg_type, 'without anyone waiting for output', outputMap, response);
  } else if (isReply && !!outputMap[parentMessageId]) {
    log('warn', msg_type, 'without parent waiting for output', outputMap, response);
  }

  return !!outputMap[parentMessageId];
}

/**
 * @param {JupyterClientResponse} response
 * @returns {boolean}
 */
function isEvalResult(response) {
  const source = response.source;

  return source === 'eval' && _.isString(response.id);
}

/**
 * @param {JupyterClient} client
 * @param {*} message
 */
function requestInputFromUser(client, message) {
  client.emit('input_request', message);
}

function broadcastKernelStatus(client, message) {
  client.emit('status', message.content.execution_state);
}

/**
 * @param {object} request
 * @param {object} result
 */
function resolveRequest(request, result) {
  // payload is deprecated, so don't even expose it
  request.deferred.resolve(_.omit(result.content, 'payload', 'engine_info', 'execution_count'));

  // we're done reporting about this topic
  delete outputMap[request.msg_id];
}

/**
 * @param {{status: string, id: string}} obj
 * @returns {boolean}
 */
function isStartComplete(obj) {
  return obj.status === 'complete' && obj.id === 'startup-complete';
}

