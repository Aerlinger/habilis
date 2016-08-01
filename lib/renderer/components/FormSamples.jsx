import React, { Component } from 'react'

export default class MainPane extends Component {

  constructor() {
    super()

    this.state = {}
  }

  static get defaultProps() {
    return {}
  }

  render() {
    return (
      <div className="padded-more">
        <button className="btn btn-mini btn-default">Default</button>
        <button className="btn btn-mini btn-primary">Primary</button>
        <button className="btn btn-mini btn-positive">Positive</button>
        <button className="btn btn-mini btn-negative">Negative</button>
        <button className="btn btn-mini btn-warning">Warning</button>

        <form>
          <div className="form-group">
            <label>Email address</label>
            <input type="email" className="form-control" placeholder="Email"/>
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" className="form-control" placeholder="Password"/>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="form-control" rows="3"></textarea>
          </div>
          <select className="form-control">
            <option>Option one</option>
            <option>Option two</option>
            <option>Option three</option>
            <option>Option four</option>
            <option>Option five</option>
            <option>Option six</option>
            <option>Option seven</option>
            <option>Option eight</option>
          </select>
          <div className="checkbox">
            <label>
              <input type="checkbox"/> This is a checkbox
            </label>
          </div>
          <div className="checkbox">
            <label>
              <input type="checkbox"/> This is a checkbox too
            </label>
          </div>
          <div className="radio">
            <label>
              <input type="radio" name="radios" defaultChecked="true"/>
              Keep your options open
            </label>
          </div>
          <div className="radio">
            <label>
              <input type="radio" name="radios"/>
              Be sure to remember
            </label>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-form btn-default">Cancel</button>
            <button type="submit" className="btn btn-form btn-primary">OK</button>
          </div>
        </form>
      </div>

    )
  }
}
