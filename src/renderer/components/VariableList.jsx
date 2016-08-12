import React, { Component } from 'react'
import {connect} from 'react-redux'
import PureRenderMixin from 'react-addons-pure-render-mixin'

class VariableList extends Component {

  constructor() {
    super()
  }

  render() {
    return (
      <table className="table-striped">
        <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Size</th>
        </tr>
        </thead>

        <tbody>

        {
          this.props.variables.map(
            variable =>
              <tr key={variable.name}>
                <td>{variable.name}</td>
                <td>{variable.type}</td>
                <td>{variable.description}</td>
              </tr>
          )
        }

        </tbody>
      </table>
    )
  }
}

function mapStateToProps(state) {
  return {
     variables: state.variables
  }
}

export default connect(mapStateToProps)(VariableList)
