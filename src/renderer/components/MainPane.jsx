import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import Codemirror from 'react-codemirror'
import 'codemirror/mode/python/python'

import styles from './MainPane.css'
import * as editor_actions from '../actions/editor'

class MainPane extends Component {
  constructor() {
    super()

    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this)
  }

  componentDidMount() {
    let editor = this.refs.codeeditor.getCodeMirror()
    let msg = document.createElement("div")
    let icon = msg.appendChild(document.createElement("span"))
    
    icon.innerHTML = "<hr>"
    icon.className = "lin-error-icon";
    msg.className = "lint-error"

    // editor.addLineWidget(2, msg, {coverGutter: false, noHScroll: true})
  }

  render() {
    let options = {
      lineNumbers: true
    }

    return (
      <Codemirror value={this.props.value}
                  onChange={this.props.onChange}
                  tabSize={2}
                  tabindex="0"
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
  return bindActionCreators(editor_actions, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(MainPane)
