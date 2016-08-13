import immutable from 'immutable'
import _ from 'lodash'

const initialState = [
  {
    name: "VARNAME",
    type: "<INT>",
    description: "DESCR."
  }
]

export default function variables(state = initialState, action) {


  switch (action.type) {
    case "ADD_VARIABLE":
      return state.concat([
        {
          name:     action['name'],
          dataType: action['dataType'],
          preview:  action['preview']
        }
      ])

    case "REMOVE_VARIABLE":
      return _.reject(state, item => item['name'] === action['name'])

    case "CLEAR_VARIABLES":
      return []
  }

  return state
}
