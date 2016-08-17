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
        "ENV": {
          python_ver: "2.7.11",
          modules: []
        },
        "kernel": [
          version: "",
          port: "",
          pid: "",
          status: "",
          namespace: {}
        ],
        "currentWorkingDirectory": ".",
        "routing":                 {
          "locationBeforeTransitions": null
        },
        "editor":                  {
          "hasFocus": true,
          "value": "def some_function():\n  a = 5\ndef another_function():\n  return \"foo\"",
          "pos": [30, 13],
          "cells": [
            {
              startLine: "int",
              endLine: "int",
              documentation: "",
              idx: 0,
              dirty: false,
              id: "1",
              state: "idle",
              lines: [
                "def another_function():\n  return \"foo\"",
              ],
              sha: "abcd1234",
              "output": {
                id: "abcd1234",
                type: "table",
                value: "<table></table>"
              },
              "history": [
                {
                  from: { ch: 0, line: 0 },
                  to { ch: 14, 1 },
                  text: ["def some_function"],
                  removed: ["def some_function"],
                  origin: "setValue"
                }
              ]
            }
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
