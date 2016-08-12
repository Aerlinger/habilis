/* eslint no-unused-expressions: 0 */
import { expect } from 'chai'
import { spy } from 'sinon'
import variables from '../../../src/renderer/reducers/variables'


describe('variable reducer', () => {
  it("adds a variable", () => {
    let initialState = []

    let resultingState = variables(initialState, {
      type:     "ADD_VARIABLE",
      name:     "foo",
      dataType: "int",
      preview:  "3"
    })

    expect(resultingState).to.eql([
      {
        name:     "foo",
        dataType: "int",
        preview:  "3"
      }
    ])
  })

  it("removes an existing variable", () => {
    let initialState = [
      {
        name:     "foo",
        dataType: "int",
        preview:  "3"
      },
      {
        name:     "bar",
        dataType: "string",
        preview:  "three"
      }
    ]

    let resultingState = variables(initialState, {
      type: "REMOVE_VARIABLE",
      name: "foo"
    })

    expect(resultingState).to.eql([
      {
        name:     "bar",
        dataType: "string",
        preview:  "three"
      }
    ])
  })

  it("can't remove a non-existent variable", () => {
    let initialState = [
      {
        name:     "foo",
        dataType: "int",
        preview:  "3"
      },
      {
        name:     "bar",
        dataType: "string",
        preview:  "three"
      }
    ]

    let resultingState = variables(initialState, {
      type: "REMOVE_VARIABLE",
      name: "idontexist"
    })

    expect(resultingState).to.eql([
      {
        name:     "foo",
        dataType: "int",
        preview:  "3"
      },
      {
        name:     "bar",
        dataType: "string",
        preview:  "three"
      }
    ])
  })

  it("updates a variable", () => {
    let initialState = [
      {
        name:     "foo",
        dataType: "int",
        preview:  "3"
      },
      {
        name:     "bar",
        dataType: "string",
        preview:  "three"
      }
    ]

    let resultingState = variables(initialState, {
      type: "REMOVE_VARIABLE",
      name: "idontexist"
    })

    expect(resultingState).to.eql([
      {
        name:     "foo",
        dataType: "int",
        preview:  "3"
      },
      {
        name:     "bar",
        dataType: "string",
        preview:  "three"
      }
    ])
  })

  it("removes all variables", () => {
    let initialState = [
      {
        name:     "foo",
        dataType: "int",
        preview:  "3"
      }
    ]

    let resultingState = variables(initialState, {
      type: "CLEAR_VARIABLES"
    })

    expect(resultingState).to.eql([])
  })
})
