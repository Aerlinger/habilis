import _ from 'lodash'
import ipc from 'ipc'
// import { local } from './store';
// import track from './track';

// import dialogActions from '../actions/dialogs'
// import applicationActions from '../actions/application'
// import editorTabGroupActions from '../containers/editor-tab-group/editor-tab-group.actions'
// import terminalActions from '../containers/terminal/terminal.actions'
import iopubActions from '../actions/iopub'
import kernelActions from '../actions/kernel'
import plotViewerActions from '../containers/plot-viewer/plot-viewer.actions'

/**
 * These are dispatched from the server, usually from interaction with native menus.
 *
 * @namespace
 */

/*
 const dispatchMap = {
 SHOW_ABOUT_RODEO:        () => dialogActions.showAboutRodeo(),
 SHOW_ABOUT_STICKER:      () => dialogActions.showAboutStickers(),
 SHOW_PREFERENCES:        () => dialogActions.showPreferences(),
 CHECK_FOR_UPDATES:       () => applicationActions.checkForUpdates(),
 TOGGLE_DEV_TOOLS:        () => applicationActions.toggleDevTools(),
 QUIT:                    () => applicationActions.quit(),
 SAVE_ACTIVE_FILE:        () => editorTabGroupActions.saveActiveFile(),
 SHOW_SAVE_FILE_DIALOG:   () => editorTabGroupActions.showSaveFileDialogForActiveFile(),
 SHOW_OPEN_FILE_DIALOG:   () => editorTabGroupActions.showOpenFileDialogForActiveFile(),
 FOCUS_ACTIVE_ACE_EDITOR: () => editorTabGroupActions.focus(),
 FOCUS_ACTIVE_TERMINAL:   () => terminalActions.focus(),
 FOCUS_NEWEST_PLOT:       () => plotViewerActions.focusNewestPlot(),
 TERMINAL_INTERRUPT:      () => terminalActions.interrupt(),
 TERMINAL_RESTART:        () => terminalActions.restart()
 }
 */

const iopubDispatchMap = {
  execute_input:  dispatchIOPubExecuteInput,
  stream:         dispatchIOPubStream,
  execute_result: dispatchIOPubResult,
  display_data:   dispatchIOPubDisplayData,
  error:          dispatchIOPubError,
  status:         dispatchIOPubStatus,
  comm_msg:       dispatchNoop,
  comm_open:      dispatchNoop,
  clear_output:   dispatchNoop
}

const shellDispatchMap = {
  execute_reply: dispatchShellExecuteReply
}

const detectVariables = _.debounce(function(dispatch) {
  dispatch(kernelActions.detectKernelVariables())
}, 500)

/**
 * @param {function} dispatch
 */
function internalDispatcher(dispatch) {
  ipc.on('dispatch', function(event, action) {
    if (dispatchMap[action.type]) {
      return dispatch(dispatchMap[action.type]())
    } else {
      return dispatch(action)
    }
  })
}

function dispatchShellExecuteReply(dispatch, content) {
  let payload = content && content.payload

  // it's okay if lots of things have no payloads.  Ones that have payloads are really important though.
  _.each(payload, function(result) {
    const text = _.get(result, 'data["text/plain"]')

    if (text) {
      // this text includes ANSI color
      dispatch(terminalActions.addOutputBlock(text))
    } else {
      console.log('dispatchShellExecuteReply', 'unknown content type', result)
    }
  })
}

function dispatchIOPubResult(dispatch, content) {
  let data = content && content.data
  let text = data && data['text/plain']

  if (text) {
    dispatch(terminalActions.addOutputText(text))
  } else {
    console.log('dispatchIOPubResult', 'unknown content type', data)
  }

  dispatch(iopubActions.resultComputed(content.data))
  detectVariables(dispatch)
}

function dispatchIOPubDisplayData(dispatch, content) {
  dispatch(terminalActions.addDisplayData(content.data))
  dispatch(iopubActions.dataDisplayed(content.data))

  if (local.get('plotsFocusOnNew') !== false)
    dispatch(plotViewerActions.focusNewestPlot())


  detectVariables(dispatch)
}

function dispatchIOPubError(dispatch, content) {
  dispatch(terminalActions.addErrorText(content.ename, content.evalue, content.traceback))
  dispatch(iopubActions.errorOccurred(content.ename, content.evalue, content.traceback))

  detectVariables(dispatch)
}

function dispatchIOPubStream(dispatch, content) {
  dispatch(terminalActions.addOutputText(content.text))
  dispatch(iopubActions.dataStreamed(content.name, content.text))

  detectVariables(dispatch)
}

function dispatchIOPubExecuteInput(dispatch, content) {
  dispatch(iopubActions.inputExecuted(content.code))

  detectVariables(dispatch)
}

function dispatchIOPubStatus(dispatch, content) {
  dispatch(iopubActions.stateChanged(content.execution_state))
}

function dispatchNoop() {
  // eat it, we don't care about these yet
}

/**
 * Jupyter sends IOPUB events to broadcast to every client connected to a session.  Various components may be
 * listening and reacting to these independently, without connection to each other.
 * @param {function} dispatch
 */
function iopubDispatcher(dispatch) {
  ipc.on('iopub', function(event, data) {
    const result  = data.result
          let content = _.get(data, 'result.content')

    if (result && iopubDispatchMap[result.msg_type]) {
      return iopubDispatchMap[result.msg_type](dispatch, content)
    }

    return dispatch(iopubActions.unknownEventOccurred(data))
  })
}

function shellDispatcher(dispatch) {
  ipc.on('shell', function(event, data) {
    const result  = data.result,
          content = _.get(data, 'result.content')

    if (result && shellDispatchMap[result.msg_type]) {
      return shellDispatchMap[result.msg_type](dispatch, content)
    }

    console.log('shell', { data })
  })
}

function stdinDispatcher() {
  ipc.on('stdin', function(event, data) {
    console.log('stdin', { event, data })
  })
}

function otherDispatcher(dispatch) {
  ipc.on('event', function(event, data) {
    console.log('event', data)
  })

  ipc.on('error', function(event, data) {
    console.log('error', data)
  })

  ipc.on('sharedAction', function(event, action) {
    console.log('received sharedAction', action)
    if (action.senderName) {
      console.log('dispatching sharedAction', action.senderName, action)
      dispatch(action)
    }
  })
}

/**
 * The node process will always forward events to the UI here to give a chance to respond to them.
 *
 * An application like this should be UI-driven, so even if the
 * node process could do something on its own, it _shouldn't_.
 * @param {function} dispatch
 */
export default function(dispatch) {
  iopubDispatcher(dispatch)
  shellDispatcher(dispatch)
  stdinDispatcher()
  internalDispatcher(dispatch)
  otherDispatcher(dispatch)  // Includes 'event', 'error', 'sharedAction'
}
