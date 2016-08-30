import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PureRenderMixin from 'react-addons-pure-render-mixin'

import * as KernelActions from '../actions/kernel'

class Toolbar extends Component {

  constructor() {
    super()

    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this)
  }

  render() {
    return (
      <header className="toolbar toolbar-header">
        <h1 className="title">{ this.props.title }</h1>

        <div className="toolbar-actions">
          <div className="btn-group">

            <button className="btn btn-default">
              <span className="icon icon-home"></span>
            </button>

            <button className="btn btn-default active">
              <span className="icon icon-cloud"></span>
            </button>

            <button className="btn btn-default">
              <span className="icon icon-popup"></span>
            </button>
          </div>

          <div className="btn-group">
            <button id="execute" className="btn btn-positive" onClick={ this.execute }>
              <span className="icon icon-play icon-text"></span>
              Execute
            </button>

            <button className="btn btn-primary">
              <span className="icon icon-book icon-text" onClick={ this.getDoc }></span>
              Get Doc
            </button>

            <button className="btn btn-primary" onClick={ this.getCompletion }>
              <span className="icon icon-code icon-text"></span>
              Completion
            </button>

            <button className="btn btn-primary" onClick={ this.props.getVariables }>
              <span className="icon icon-list icon-text"></span>
              Variables
            </button>

            <button className="btn btn-primary">
              <span className="icon icon-doc-text icon-text"></span>
              History
            </button>

            <button className="btn btn-primary">
              <span className="icon icon-check icon-text"></span>
              Completeness
            </button>

            <button className="btn btn-default">
              <span className="icon icon-eye icon-text"></span>
              Introspect
            </button>

            <button className="btn btn-default">
              <span className="icon icon-info icon-text"></span>
              Get Kernel Info
            </button>

            <button className="btn btn-negative">
              <span className="icon icon-cancel icon-close"></span>
              Shutdown Kernel
            </button>
          </div>

          <button className="btn btn-default btn-dropdown pull-right">
            <span className="icon icon-megaphone"></span>
          </button>

          <span className="icon icon-hourglass icon-text">Idle</span>
        </div>
      </header>
    )
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  return bindActionCreators(KernelActions, dispatch)
}

export default connect(null, mapDispatchToProps)(Toolbar)
