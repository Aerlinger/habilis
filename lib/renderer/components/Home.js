import React, { Component } from 'react'
import { Link } from 'react-router'
import styles from './Home.css'

import Codemirror from 'react-codemirror'
import MarkdownPreview from './MarkdownPreview'
import MDReactComponent from 'markdown-react-js'
import ReactGridLayout from 'react-grid-layout'

import 'codemirror/mode/python/python'


export default class Home extends Component {
  constructor() {
    super()

    this.state = {
      code: "// Code"
    }
  }

  updateCode(newCode) {
    this.setState({
      code: newCode
    })
  }

  onRun(){
    console.log("Run")
  }

  onCheck() {
    console.log("Check")
  }

  onGetDocs() {
    console.log("Docs")
  }

  onGetVars() {
    console.log("Vars")
  }

  render() {
    let options = {
      lineNumbers: true
    }

    return (
      <div id="main">
        <Codemirror onChange={this.updateCode.bind(this)} options={options} />
        <button onClick={this.onRun.bind(this)}>Run</button>
        <button onClick={this.onCheck.bind(this)}>Check</button>
        <button onClick={this.onGetDocs.bind(this)}>Get docs</button>
        <button onClick={this.onGetVars.bind(this)}>Get vars</button>

        <MarkdownPreview text="Some text with **emphasis!**"/>
      </div>
    );
  }
}
