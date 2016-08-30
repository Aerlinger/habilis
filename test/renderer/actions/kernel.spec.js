import { spy } from 'sinon'
import { expect } from 'chai'
import electronPath from 'electron-prebuilt'
import { Application } from 'spectron'

import * as kernelActions from '../../../src/renderer/actions/kernel'

describe.only('Kernel Actions', function() {
  this.app = null

  before(async() => {
    this.app = new Application({
      path: electronPath,
      args: ['.'],
    })

    return this.app.start()
  })

  after(() => {
    if (this.app && this.app.isRunning()) {
      return this.app.stop()
    }
  })

  it("updates busy status", () => {
    expect(kernelActions.isBusy()).to.eql({
      type: 'KERNEL_IS_BUSY'
    })
  })

  it("updates idle status", () => {
    expect(kernelActions.isIdle()).to.eql({
      type: 'KERNEL_IS_IDLE'
    })
  })

  it("sends event on kernelDetected", () => {
    let pythonOptions = {}

    let kernelDetected = kernelActions.kernelDetected(pythonOptions)

    expect(kernelDetected).to.eql({
      type: 'KERNEL_DETECTED',
      pythonOptions
    })
  })

  it("can dispatch kernel detected", () => {
    let interrupt = kernelActions.interrupt()
    expect(interrupt).to.be.a('function')

    const dispatch = spy()
    const getState = () => ({})

    interrupt(dispatch, getState)

  })

  it("receives request from Main for python options", () => {
    expect(kernelActions.askForPythonOptions()).to.eql({
      type: 'ASK_FOR_PYTHON_OPTIONS'
    })
  })


  it("interrupts", () => {
    let interrupt = kernelActions.interrupt()
    expect(interrupt).to.be.a('function')

    const dispatch = spy()
    const getState = () => ({})

    interrupt(dispatch, getState)

    /** TODO:
     setTimeout(() => {
      expect(dispatch.calledWith({ type: actions.INCREMENT_COUNTER })).to.be.true
      done()
    }, 5)
     */

  })
})
