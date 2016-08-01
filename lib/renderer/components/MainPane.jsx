import React, { Component } from 'react'

import Codemirror from 'react-codemirror'
import 'codemirror/mode/python/python'

import styles from './MainPane.css'

export default class MainPane extends Component {

  constructor() {
    super()

    this.state = {}
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
      <div className={styles.main_pane}>
        <Codemirror value={this.state.code} onChange={this.updateCode.bind(this)} options={options} ref="codeeditor"/>
      </div>
    )
  }
}
