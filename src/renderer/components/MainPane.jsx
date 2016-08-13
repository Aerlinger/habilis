import React, { Component } from 'react'
import { connect } from 'react-redux'
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

class MainPane extends Component {

  constructor() {
    super()

    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this)
  }

  render() {
    let options = {
      lineNumbers: true
    }

    return (
      <Codemirror value={this.props.value}
                  onChange={this.props.onChange}
                  options={options}
                  ref="codeeditor"/>
    )
  }
}

function mapStateToProps(state) {
  return {
    value: state.editor.value
  }
}

function mapDispatchToProps(dispatch) {
  return {
    onChange: function(data) {
      dispatch({
        type: "EDITOR_UPDATE_TEXT",
        value: data
      })
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MainPane)
