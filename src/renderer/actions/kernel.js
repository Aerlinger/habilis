import { send } from '../ipc'

// Kernel-specific events
// https://ipython.org/ipython-doc/3/development/messaging.html
// https://github.com/ipython/ipython/wiki/Dev:-Javascript-Events
//

export function interrupt() {
  return function(dispatch) {
    dispatch({ type: 'INTERRUPTING_KERNEL' })

    return send('interrupt')
      .then(() => dispatch({ type: 'INTERRUPTED_KERNEL' }))
      .catch(error => dispatch(errorCaught(error)))
  }
}

export function isBusy() {
  return { type: 'KERNEL_IS_BUSY' }
}

export function isIdle() {
  return { type: 'KERNEL_IS_IDLE' }
}

export function kernelDetected(pythonOptions) {
  // save over previous settings
  if (!pythonOptions.cmd) {
    throw new Error('Unacceptable python options without cmd that created it');
  }

  local.set('pythonOptions', pythonOptions);
  local.set('pythonCmd', pythonOptions.cmd);
  return { type: 'KERNEL_DETECTED', pythonOptions };
}

export function askForPythonOptions() {
  return {
    type: 'ASK_FOR_PYTHON_OPTIONS'
  }
}

export function detectKernel() {
  return function(dispatch) {
    const pythonCmd = local.get('pythonCmd');
    let promise;

    if (pythonCmd) {
      // verify anyway
      promise = clientDiscovery.checkKernel({ cmd: pythonCmd })
                               .catch(() => clientDiscovery.getFreshPythonOptions());
    } else {
      // get them
      promise = clientDiscovery.getFreshPythonOptions();
    }

    return promise
      .then(pythonOptions => dispatch(kernelDetected(pythonOptions)))
      .catch(error => {
        console.warn('error using detected python', error);

        return dispatch(askForPythonOptions());
      });
  };
}

export function restart() {
  return function(dispatch) {
    return client.restartInstance()
                 .then(() => dispatch({ type: 'KERNEL_RESTARTED' }))
                 .catch(error => dispatch(errorCaught(error)));
  };
}

function detectKernelVariables() {
  return function(dispatch, getState) {
    const state    = getState(),
          terminal = _.find(state.terminals, { hasFocus: true }),
          id       = terminal.id;

    return client.getStatus().then(function(status) {
      const variables = status.variables,
            cwd       = status.cwd;

      dispatch({ type: 'VARIABLES_CHANGED', variables, id })
      dispatch({ type: 'WORKING_DIRECTORY_CHANGED', cwd, id })

      return status;
    }).catch(error => dispatch(errorCaught(error)));
  };
}

export function executeActiveFileInActiveConsole() {
  return function(dispatch, getState) {
    const state           = getState(),
          items           = _.head(state.editorTabGroups).items,
          focusedAce      = state && _.find(items, { hasFocus: true }),
          el              = focusedAce && document.querySelector('#' + focusedAce.id),
          aceInstance     = el && ace.edit(el),
          filename        = focusedAce.filename,
          focusedTerminal = state && _.find(state.terminals, { hasFocus: true }),
          id              = focusedTerminal.id,
          content         = aceInstance && aceInstance.getSession().getValue()

    if (content) {
      dispatch({ type: 'EXECUTING', filename, id })

      return client.execute(content)
                   .then(() => dispatch({ type: 'EXECUTED', id }))
                   .catch(error => dispatch(errorCaught(error)))
    }
  }
}

export function executeActiveFileSelectionInActiveConsole() {
  return function(dispatch, getState) {
    const state       = getState(),
          items       = _.head(state.editorTabGroups).items,
          focusedAce  = state && _.find(items, { hasFocus: true }),
          el          = focusedAce && document.querySelector('#' + focusedAce.id),
          aceInstance = el && ace.edit(el);

    aceInstance.commands.exec('liftSelection', aceInstance);
  }
}

export default {
  askForPythonOptions,
  detectKernel,
  detectKernelVariables,
  executeActiveFileInActiveConsole,
  executeActiveFileSelectionInActiveConsole,
  isBusy,
  isIdle,
  interrupt,
  kernelDetected,
  restart
}


/**
 {
    'shell_port' : int,   // The port the shell ROUTER socket is listening on.
    'iopub_port' : int,   // The port the PUB socket is listening on.
    'stdin_port' : int,   // The port the stdin ROUTER socket is listening on.
    'hb_port' : int,      // The port the heartbeat socket is listening on.
  }
 */
export function connect() {
  return {
    type: 'KERNEL_CONNECT',
          code
  }
}


/**
 content = {
    'restart' : bool // whether the shutdown is final, or precedes a restart
  }
 */
export function shutdown(restart = false) {
  return {
    type: 'KERNEL_SHUTDOWN',
          restart
  }
}

/**
 response = {
    // Version of messaging protocol.
    // The first integer indicates major version.  It is incremented when
    // there is any backward incompatible change.
    // The second integer indicates minor version.  It is incremented when
    // there is any backward compatible change.
    'protocol_version': 'X.Y.Z',

    // The kernel implementation name
    // (e.g. 'ipython' for the IPython kernel)
    'implementation': str,

    // Implementation version number.
    // The version number of the kernel's implementation
    // (e.g. IPython.__version__ for the IPython kernel)
    'implementation_version': 'X.Y.Z',

    // Information about the language of code for the kernel
    'language_info': {
        // Name of the programming language in which kernel is implemented.
        // Kernel included in IPython returns 'python'.
        'name': str,

        // Language version number.
        // It is Python version number (e.g., '2.7.3') for the kernel
        // included in IPython.
        'version': 'X.Y.Z',

        // mimetype for script files in this language
        'mimetype': str,

        // Extension including the dot, e.g. '.py'
        'file_extension': str,

        // Pygments lexer, for highlighting
        // Only needed if it differs from the top level 'language' field.
        'pygments_lexer': str,

        // Codemirror mode, for for highlighting in the notebook.
        // Only needed if it differs from the top level 'language' field.
        'codemirror_mode': str or dict,

        // Nbconvert exporter, if notebooks written with this kernel should
        // be exported with something other than the general 'script'
        // exporter.
        'nbconvert_exporter': str,
    },

    // A banner of information about the kernel,
    // which may be desplayed in console environments.
    'banner' : str,

    // Optional: A list of dictionaries, each with keys 'text' and 'url'.
    // These will be displayed in the help menu in the notebook UI.
    'help_links': [
        {'text': str, 'url': str}
    ],
  }
 */
export function info(code) {
  return {
    type: 'KERNEL_INFO',
          code
  }
}

/**
 response = {
  // One of: 'ok' OR 'error' OR 'abort'
  'status' : str,

  // The global kernel counter that increases by one with each request that
  // stores history.  This will typically be used by clients to display
  // prompt numbers to the user.  If the request did not store history, this will
  // be the current value of the counter in the kernel.
  'execution_count' : int,

  // 'payload' will be a list of payload dicts, and is optional.
  // payloads are considered deprecated.
  // The only requirement of each payload dict is that it have a 'source' key,
  // which is a string classifying the payload (e.g. 'page').

  'payload' : list(dict),

  // Results for the user_expressions.
  'user_expressions' : dict,
 }

 */
export function execute(
  code,
  silent = false,
  store_history = true,
  user_expressions = {},
  allow_stdin = true,
  stop_on_error = false
)
{
  return {
    type: 'KERNEL_EXECUTE',

    /// Source code to be executed by the kernel, one or more lines.
    code,

    // A boolean flag which, if True, signals the kernel to execute
    // this code as quietly as possible.
    // silent=True forces store_history to be False,
    // and will *not*:
    //   - broadcast output on the IOPUB channel
    //   - have an execute_result
    // The default is False.
    silent,

    // A boolean flag which, if True, signals the kernel to populate history
    // The default is True if silent is False.  If silent is True, store_history
    // is forced to be False.
    store_history,

    // A dict mapping names to expressions to be evaluated in the
    // user's dict. The rich display-data representation of each will be evaluated after execution.
    // See the display_data content for the structure of the representation data.
    user_expressions,

    // Some frontends do not support stdin requests.
    // If raw_input is called from code executed from such a frontend,
    // a StdinNotImplementedError will be raised.
    allow_stdin,

    // A boolean flag, which, if True, does not abort the execution queue, if an exception is encountered.
    // This allows the queued execution of multiple execute_requests, even if they generate exceptions.
    stop_on_error
  }
}

/**
 response = {
    // The code context in which introspection is requested
    // this may be up to an entire multiline cell.
    'code' : str,

    // The cursor position within 'code' (in unicode characters) where inspection is requested
    'cursor_pos' : int,

    // The level of detail desired.  In IPython, the default (0) is equivalent to typing
    // 'x?' at the prompt, 1 is equivalent to 'x??'.
    // The difference is up to kernels, but in IPython level 1 includes the source code
    // if available.
    'detail_level' : 0 or 1,
  }
 */
export function introspect(code, cursor_pos, detail_level = 1) {
  return {
    type: 'KERNEL_INTROSPECTION',
    // The code context in which introspection is requested
    // this may be up to an entire multiline cell.
          code,

    // The cursor position within 'code' (in unicode characters) where inspection is requested
    cursor_pos,

    // The level of detail desired.  In IPython, the default (0) is equivalent to typing
    // 'x?' at the prompt, 1 is equivalent to 'x??'.
    // The difference is up to kernels, but in IPython level 1 includes the source code
    // if available.
    detail_level // 0 or 1
  }
}


/**
 * @param code
 * @response

 content = {
      // The list of all matches to the completion request, such as
      // ['a.isalnum', 'a.isalpha'] for the above example.
      'matches' : list,

      // The range of text that should be replaced by the above matches when a completion is accepted.
      // typically cursor_end is the same as cursor_pos in the request.
      'cursor_start' : int,
      'cursor_end' : int,

      // Information that frontend plugins might use for extra display information about completions.
      'metadata' : dict,

      // status should be 'ok' unless an exception was raised during the request,
      // in which case it should be 'error', along with the usual error message content
      // in other messages.
      'status' : 'ok'
    }
 * @returns {{type: string}}
 */
export function complete(code, cursor_pos) {
  return {
    type: 'KERNEL_COMPLETION',
    // The code context in which completion is requested
    // this may be up to an entire multiline cell, such as
    // 'foo = a.isal'
          code,

    // The cursor position within 'code' (in unicode characters) where completion is requested
    cursor_pos
  }
}

export function getVariables() {

}

/**
 *
 response = {
  // A list of 3 tuples, either:
  // (session, line_number, input) or
  // (session, line_number, (input, output)),
  // depending on whether output was False or True, respectively.
  'history' : list,
  }
 */
export function history(
  output = false,
  raw = true,
  hist_access_type = 'tail',
  start = 0,
  stop = 0,
  n = 100,
  session = 0,
  pattern = "*",
  unique = false
)
{
  return {
    type: 'KERNEL_HISTORY',

    // If True, also return output history in the resulting dict.
    output,

    // If True, return the raw input history, else the transformed input.
    raw,

    // So far, this can be 'range', 'tail' or 'search'.
    hist_access_type,

    // If hist_access_type is 'range', get a range of input cells. session can
    // be a positive session number, or a negative number to count back from
    // the current session.
    session,
    // start and stop are line numbers within that session.
    start,
    stop,

    // If hist_access_type is 'tail' or 'search', get the last n cells.
    n,

    // If hist_access_type is 'search', get cells matching the specified glob
    // pattern (with * and ? as wildcards).
    pattern,

    // If hist_access_type is 'search' and unique is true, do not
    // include duplicated history.  Default is false.
    unique
  }
}

/**
 result = {
    // One of 'complete', 'incomplete', 'invalid', 'unknown'
    'status' : str,

    // If status is 'incomplete', indent should contain the characters to use
    // to indent the next line. This is only a hint: frontends may ignore it
    // and use their own autoindentation rules. For other statuses, this
    // field does not exist.
    'indent': str,
  }
 */
export function completeness(code) {
  return {
    type: 'KERNEL_COMPLETENESS',
          code
  }
}
