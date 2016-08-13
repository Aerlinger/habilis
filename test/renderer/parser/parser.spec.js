/* eslint no-unused-expressions: 0 */
import { expect } from 'chai'
import { spy } from 'sinon'
import { generate } from 'pegjs'
// import parser from "parser"


// import reducers from '../../../src/renderer/reducers/editor'

describe.only('Parser', () => {
  let parser

  before( () => {
    parser = generate("start = ('a' / 'b')+")
  })

  it("recognizes a string comment", () => {
    expect(parser.parse("abba")).to.eql(["a", "b", "b", "a"])
  })
})
