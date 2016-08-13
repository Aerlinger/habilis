/* eslint no-unused-expressions: 0 */
import fs from 'fs'
import { expect } from 'chai'
import { spy } from 'sinon'
import { generate, parse } from 'pegjs'

import Tracer from 'pegjs-backtrace'

describe.only('Parser', () => {
  let parser

  before(() => {
    let grammar = fs.readFileSync('./src/renderer/parser/grammars/python.pegjs', { encoding: "utf-8" })

    parser = generate(grammar, { trace: true })
  })

  it("recognizes a string comment", () => {
    let input  =
          `'''asdf:doc:asfd'''
def test():
  5`
    let tracer = new Tracer(input)

    try {
      let parsed = parser.parse(input, { tracer })
      expect(parsed.cell).to.eql({
          doc:  {
            "content": "asfd",
            "type":    "doc"
          },
          func: {
            "block":      [
              5
            ],
            "name":       "test",
            "parameters": [],
            "type":       "function"
          }
        })
    } catch(e) {
      console.log(tracer.getBacktraceString())
      throw e
    }

  })
})
