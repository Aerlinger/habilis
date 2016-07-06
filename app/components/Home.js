import React, { Component } from 'react';
import { Link } from 'react-router';
import styles from './Home.css';

import AceEditor from 'react-ace';
import MarkdownPreview from './MarkdownPreview'
import MDReactComponent from 'markdown-react-js'

import 'brace/mode/python';
import 'brace/theme/github';

function onChange(newValue) {
  console.log('ACE change: ', newValue);
}

export default class Home extends Component {
  render() {
    return (
      <div id="main">
        <AceEditor
          mode="python"
          theme="github"
          onChange={onChange}
          name="ace_editor"
          editorProps={
          { $blockScrolling: true }
        }
        />
        <MarkdownPreview mdtext="Some text with **emphasis!**"/>
      </div>
    );
  }
}
