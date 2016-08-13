import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import className from 'classnames'
import CodeMirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/python/python'
import _ from 'lodash'

import styles from './Editor.css'
import * as editor_actions from '../actions/editor'

class Editor extends Component {
  constructor() {
    super()

    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this)
  }

  static get propTypes() {
    return {
      onChange: React.PropTypes.func,
      onFocusChange: React.PropTypes.func,
      options: React.PropTypes.object,
      path: React.PropTypes.string,
      value: React.PropTypes.string,
      className: React.PropTypes.any,
      codeMirrorInstance: React.PropTypes.object
    }
  }

  static get defaultProps() {
    return {
      className: "codemirror-container"
    }
  }

  /**
   * Experimental
   *
   *
   */

  makeMarker() {
    let marker = document.createElement("div")
    marker.style.color = "#822"
    marker.innerHTML = "●"

    return marker
  }

  getCodeMirrorInstance() {
    return this.props.codeMirrorInstance || require('codemirror')
  }

  getCodeMirror() {
    return this.codeMirror
  }

  codemirrorValueChanged(doc, change) {
    if (this.props.onChange && change.origin != 'setValue') {
      this.props.onChange(doc.getValue())
    }
  }

  componentDidMount() {
    let options = {
      lineNumbers:     true,
      gutters:         ["CodeMirror-linenumbers", "breakpoints"]
    }

    let codeMirrorInstance = this.getCodeMirrorInstance()

    this.codeMirror = codeMirrorInstance.fromTextArea(this.refs.editor, options)

    this.codeMirror.on('change', this.codemirrorValueChanged.bind(this))

    this.codeMirror.on("gutterClick", (cm, n, gutter, evt) => {
      let info = cm.lineInfo(n)

      console.log("N", n)
      console.log("info", info)
      console.log("gutter", gutter)
      console.log("evt", evt)

      cm.setGutterMarker(n, "breakpoints", info.gutterMarkers ? null : this.makeMarker())
    })

    this.codeMirror.setValue(this.props.defaultValue || this.props.value || '')
  }

  componentWillReceiveProps() {
    return _.debounce(function(nextProps) {
      if (this.codeMirror && nextProps.value !== undefined && this.codeMirror.getValue() != nextProps.value)
        this.codeMirror.setValue(nextProps.value)


      if (typeof nextProps.options === 'object') {
        for (let optionName in nextProps.options) {
          if (nextProps.options.hasOwnProperty(optionName)) {
            this.codeMirror.setOption(optionName, nextProps.options[optionName]);
          }
        }
      }
    }, 0)
  }

  componentWillUnmount() {
    if (this.codeMirror) {
      this.codeMirror.toTextArea()
    }
  }

  render() {
     let editorClassName = className(
       'ReactCodeMirror',
       this.props.className)

    return (
      <div className={editorClassName}>
        <textarea ref="editor"
                  name={this.props.path}
                  defaultValue={this.props.value}
                  autoComplete='off' />
      </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(Editor)
