import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import className from 'classnames'
import CodeMirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/python/python'
import _ from 'lodash'

import scrollbar from 'codemirror/addon/scroll/annotatescrollbar'
import matchesoncscrollbar from 'codemirror/addon/search/matchesonscrollbar'
import searchCursor from 'codemirror/addon/search/searchcursor'
import match_highlighter from 'codemirror/addon/search/match-highlighter'

import styles from './Editor.css'
import * as editor_actions from '../actions/editor'

class Editor extends Component {
  constructor() {
    super()

    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this)
  }

  static get propTypes() {
    return {
      onChange:           React.PropTypes.func,
      onFocusChange:      React.PropTypes.func,
      options:            React.PropTypes.object,
      path:               React.PropTypes.string,
      value:              React.PropTypes.string,
      className:          React.PropTypes.any,
      codeMirrorInstance: React.PropTypes.object
    }
  }

  static get defaultProps() {
    return {
      className: "codemirror-container"
    }
  }

  defaultOptions() {
    return {
      autofocus:                 true,
      foldGutter:                true,
      lineNumbers:               true,
      styleActiveLine:           true,
      extraKeys:                 {
        "Ctrl--": function(cm) {
          cm.foldCode(cm.getCursor())
        }
      },
      highlightSelectionMatches: { showToken: /\w/, annotateScrollbar: true },
      gutters:                   ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
    }
  }

  getCodeMirrorInstance() {
    return this.props.codeMirrorInstance || require('codemirror')
  }

  getCodeMirror() {
    return this.codeMirror
  }

  onChange(doc, change) {
    if (this.props.onChange && change.origin != 'setValue') {
      this.props.onChange(doc.getValue())
    }
  }

  onChanges(instance, changes) {
    console.log("BULK", changes)
  }

  componentDidMount() {
    let editorOptions = _.merge(this.defaultOptions(), this.props.options)

    this.codeMirror = this.getCodeMirrorInstance().fromTextArea(this.refs.editor, editorOptions)

    this.codeMirror.on('change', this.onChange.bind(this))
    this.codeMirror.on('changes', this.onChanges.bind(this))

    // this.codeMirror.setValue(this.props.defaultValue || this.props.value || '')
  }

  componentWillReceiveProps(nextProps) {
    if (this.codeMirror && nextProps.value !== undefined && this.codeMirror.getValue() != nextProps.value)
      this.codeMirror.setValue(nextProps.value)

    if (typeof nextProps.options === 'object')
      for (let optionName in nextProps.options)
        if (nextProps.options.hasOwnProperty(optionName))
          this.codeMirror.setOption(optionName, nextProps.options[optionName])
  }

  componentWillUnmount() {
    if (this.codeMirror) {
      this.codeMirror.toTextArea()
    }
  }

  render() {
    let editorClassName = className('ReactCodeMirror', this.props.className)

    return (
      <div className={editorClassName}>
        <textarea ref="editor"
                  name={this.props.path}
                  defaultValue={this.props.value}
                  autoComplete='off'/>
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
