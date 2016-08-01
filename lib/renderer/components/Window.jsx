import React, { Component } from 'react'

import Toolbar from './Toolbar'
import MainPane from './MainPane'
import FileList from './FileList'
import FormSamples from './FormSamples'

export default class Window extends Component {
  constructor() {
    super()

    this.state = {}
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
              { /*<MainPane />*/ }
              <MainPane />
            </div>

            <div className="pane-sm sidebar">
              <FileList />
            </div>

          </div>
        </div>

        {this.props.children}
      </div>

    )
  }
}
