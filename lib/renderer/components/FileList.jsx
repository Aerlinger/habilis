import React, { Component } from 'react'

export default class FileList extends Component {

  constructor() {
    super()

    this.state = {}
  }

  static get defaultProps() {
    return {}
  }

  render() {
    return (
      <table className="table-striped">
        <thead>
        <tr>
          <th>Name</th>
          <th>Kind</th>
          <th>Size</th>
        </tr>
        </thead>

        <tbody>
        <tr>
          <td>photon.css</td>
          <td>CSS</td>
          <td>28K</td>
        </tr>

        
        </tbody>
      </table>
    )
  }
}
