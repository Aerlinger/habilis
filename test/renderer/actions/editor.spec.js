/* eslint no-unused-expressions: 0 */
import { expect } from 'chai'
import { spy } from 'sinon'

import * as actions from '../../../src/renderer/actions/editor'

describe('editor actions', () => {
  it("updates editor content", () => {
    expect(actions.onChange("# This is updated")).to.eql({
      type: "EDITOR_UPDATE",
      value: "# This is updated"
    })
  })
})
