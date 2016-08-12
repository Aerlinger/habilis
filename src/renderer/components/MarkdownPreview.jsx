import React from 'react'
import Markdown from 'markdown-it/dist/markdown-it.js'
import stripIndent from 'strip-indent'

import MDReactComponent from 'markdown-react-js'

export default class MarkdownPreview extends React.Component {

  render() {
    return (
      <MDReactComponent text={this.props.text} />
    )
  }
}
