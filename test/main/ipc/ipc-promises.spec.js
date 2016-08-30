import { expect } from 'chai'
import { spawn } from 'child_process'
import _ from 'lodash'
import uuid from 'uuid'
// import { ipcMain } from 'electron'

// import ipc from '../../../src/main/ipc'
import { JupyterClient, getPythonScriptResults } from '../../../src/main/kernel/JupyterClient'
import { log, asInternal } from '../../../src/main/utils/log'

asInternal(__filename)

function getArgv() {
  let sliceNum;

  if (_.endsWith(process.argv[0], 'Electron')) {
    sliceNum = 2;
  } else {
    sliceNum = 1;
  }

  return yargs
    .env('RODEO')
    .boolean('dev').default('pythons', false)
    .boolean('pythons').default('pythons', true)
    .boolean('startup').default('startup', true)
    .parse(process.argv.slice(sliceNum));
}


/**
 * @param {object} options
 * @param {string} options.instanceId
 * @param {string} text
 * @returns {Promise}
 */
function onExecute(client, options, text) {
  if (!text) {
    throw Error('Missing text to execute');
  }

  return getKernelInstanceById(options.instanceId)
    .then(client => client.execute(text))
}

/**
 * @param {string} id
 * @returns {Promise}
 */
function getKernelInstanceById(id) {
  log('info', 'getKernelInstanceById', id);

  if (!kernelClients[id]) {
    throw new Error('Kernel with this id does not exist: ' + id);
  }

  return kernelClients[id]
}

describe.skip("IPC Promises", function() {
  let client

  this.timeout(5000)

  beforeEach(function() {
    client = new JupyterClient()

    client.on("ready", function(res) {
      done()
    })
  })


  it("maps IPC events", function(done) {

    // ipcPromises.exposeElectronIpcEvents(ipcMain, [onExecute])

  })
})

