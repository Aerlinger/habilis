import React, { Component } from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import Codemirror from 'react-codemirror'
import 'codemirror/mode/python/python'

import styles from './MainPane.css'

import { ipcRenderer } from 'electron'

ipcRenderer.on('asynchronous-reply', (event, arg) => {
  console.log(arg) // prints "pong"
})

ipcRenderer.on('code-result', (event, arg) => {
  console.log(arg) // prints code result
})

export default class MainPane extends Component {

  constructor() {
    super()

    this.state = {}

    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this)
  }

  updateCode(newCode) {
    this.setState({
      code: newCode
    })
  }

  static get defaultProps() {
    return {}
  }

  render() {
    let options = {
      lineNumbers: true
    }

    return (
      <Codemirror value={this.state.code} onChange={this.updateCode.bind(this)} options={options} ref="codeeditor"/>
    )
  }
}
