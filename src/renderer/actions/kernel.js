// Kernel-specific events
// https://github.com/ipython/ipython/wiki/Dev:-Javascript-Events
//

export function executeCode(code) {
  return {
    type: 'EXECUTE_CODE',
    code: code
  }
}
