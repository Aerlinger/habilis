import React, { Component } from 'react';
import { Link } from 'react-router';
import styles from './Home.css';

import AceEditor from 'react-ace';
import MarkdownPreview from './MarkdownPreview'
import MDReactComponent from 'markdown-react-js'
import ReactGridLayout from 'react-grid-layout'

import 'brace/mode/python';
import 'brace/theme/github';

function onChange(newValue) {
  console.log('ACE change: ', newValue);
}

export default class Home extends Component {
  render() {
    return (
      <div id="main">
        <ReactGridLayout className="layout" cols={12} rowHeight={30} width={1200}>
          <div key="a" _grid={{x: 0, y: 0, w: 6, h: 2}}>
            <AceEditor
              mode="python"
              theme="github"
              onChange={onChange}
              name="ace_editor"
              editorProps={{ $blockScrolling: true }}
            />
          </div>
          <div key="b" _grid={{x: 6, y: 0, w: 6, h: 2}}>
            <MarkdownPreview mdtext="Some text with **emphasis!**"/>
          </div>
        </ReactGridLayout>
      </div>
    );
  }
}
