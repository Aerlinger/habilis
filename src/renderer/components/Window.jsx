import React, { Component } from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin';

import Toolbar from './Toolbar'
import Editor from './Editor'
import VariableList from './VariableList'
import FormSamples from './FormSamples'

export default class Window extends Component {
  constructor() {
    super()

    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this)
  }

  render() {
    return (
      <div className="window">
        <Toolbar />

        <div className="window-content">
          <div className="pane-group">
            <div className="pane-sm sidebar">
              <FormSamples />
            </div>

            <div className="pane" style={{backgroundColor: 'lightgrey'}}>
              <Editor />
            </div>

            <div className="pane-sm sidebar">
              <VariableList />
            </div>

          </div>
        </div>

        {this.props.children}
      </div>

    )
  }
}
