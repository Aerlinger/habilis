/* eslint no-unused-expressions: 0 */
import { expect } from 'chai'
import { spy } from 'sinon'
import reducers from '../../../src/renderer/reducers/editor'

describe('Root reducer', () => {
  it("adds a variable", () => {
    let initialState = {}

    let resultingState = reducers(initialState, {
      type:     "ADD_VARIABLE",
      name:     "foo",
      dataType: "int",
      preview:  "3"
    })

    expect(resultingState).to.eql(
      {
        "currentWorkingDirectory": ".",
        "routing":                 {
          "locationBeforeTransitions": null
        },
        "editor":                  {
          "value": "# Initial Code"
        },
        "variables":               [
          {
            name:        "VARNAME",
            type:        "<INT>",
            description: "DESCR."
          },
          {
            name:     "foo",
            dataType: "int",
            preview:  "3"
          }
        ]
      }
    )
  })

})

