import React, { Component } from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { Link } from 'react-router'
import Codemirror from 'react-codemirror'
import 'codemirror/mode/python/python'

import {ipcRenderer} from 'electron'
import MDReactComponent from 'markdown-react-js'

import MarkdownPreview from './MarkdownPreview'

require('css!./Home.css')

ipcRenderer.on('asynchronous-reply', (event, arg) => {
  console.log(arg) // prints "pong"
})

ipcRenderer.on('code-result', (event, arg) => {
  console.log(arg) // prints code result
})

export default class Home extends Component {
  constructor() {
    super()

    this.state = {
      code: "63 + 4"
    }
  }

  updateCode(newCode) {
    this.setState({
      code: newCode
    })
  }

  onRun(){
    ipcRenderer.send('run-code', this.state.code)
  }

  onCheck() {
    console.log("Check")
    ipcRenderer.send('check', this.state.code)
  }

  onGetDocs() {
    console.log("Docs")
    ipcRenderer.send('docs', 'ping')
  }

  onGetVars() {
    console.log("Vars")
    ipcRenderer.send('vars', 'ping')
  }

  render() {
    let options = {
      lineNumbers: true
    }

    return (
        
      <div id="main">
        <Codemirror value={this.state.code} onChange={this.updateCode.bind(this)} options={options} ref="codeeditor"/>
        <button onClick={this.onRun.bind(this)}>Run</button>
        <button onClick={this.onCheck.bind(this)}>Check</button>
        <button onClick={this.onGetDocs.bind(this)}>Get docs</button>
        <button onClick={this.onGetVars.bind(this)}>Get vars</button>

        <MarkdownPreview text="Some text with **emphasis!**"/>
      </div>
    );
  }
}
