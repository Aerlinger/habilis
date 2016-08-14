/* eslint no-unused-expressions: 0 */
import { expect } from 'chai'
import { spy } from 'sinon'
import reducers from '../../../src/renderer/reducers'

describe('Root reducer', () => {
  it("has correct initial state", () => {
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
          "value": "def some_function():\n  a = 5\ndef another_function():\n  return \"foo\"",
          "pos": [30, 13],
          "cells": [

          ],
          "history": [

          ]
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
