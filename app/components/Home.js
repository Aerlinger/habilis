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

  onChange(newValue) {
    console.log('ACE change: ', newValue);
  }

  updateCode(newCode) {
    this.setState({
      code: newCode
    })
  }

  render() {
    let options = {
      lineNumbers: true
    }

    return (
      <div id="main">
        <ReactGridLayout className="layout" cols={12} rowHeight={30} width={1200}>

          <div key="a" data-grid={{x: 0, y: 0, w: 60, h: 20}}>
            <Codemirror  onChange={this.updateCode.bind(this)} options={options} />
          </div>

          <div key="b" data-grid={{x: 6, y: 0, w: 6, h: 2}}>
            <MarkdownPreview text="Some text with **emphasis!**"/>
          </div>

        </ReactGridLayout>
      </div>
    );
  }
}
