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

            <button className="btn btn-default">
              <span className="icon icon-folder"></span>
            </button>

            <button className="btn btn-default active">
              <span className="icon icon-cloud"></span>
            </button>

            <button className="btn btn-default">
              <span className="icon icon-popup"></span>
            </button>

            <button className="btn btn-default">
              <span className="icon icon-shuffle"></span>
            </button>
          </div>

          <button className="btn btn-positive" onClick={ this.props.executeCode }>
            <span className="icon icon-play icon-text"></span>
            Evaluate
          </button>

          <button className="btn btn-positive">
            <span className="icon icon-book icon-text"></span>
            Get Documentation
          </button>

          <button className="btn btn-positive">
            <span className="icon icon-pencil icon-text"></span>
            Get Completion
          </button>

          <button className="btn btn-positive">
            <span className="icon icon-list icon-text"></span>
            Get Variables
          </button>

          <button className="btn btn-default btn-dropdown pull-right">
            <span className="icon icon-megaphone"></span>
          </button>

          <span className="icon icon-hourglass">Idle</span>
        </div>
      </header>
    )
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  return bindActionCreators(KernelActions, dispatch)
}

export default connect(null, mapDispatchToProps)(Toolbar)
