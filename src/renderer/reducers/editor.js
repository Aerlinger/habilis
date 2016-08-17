let initialState = {
  value: `def some_function():
  a = 5
def another_function():
  return "foo"`,
  hasFocus: true
}

export default function editor(state=initialState, action) {
  switch (action.type) {
    case "EDITOR_UPDATE":
      return {
        value: action['value'],
        hasFocus: true
      }
    case "FOCUS":
      return {
        value: state['value'],
        hasFocus: true
      }
    case "FOCUS_LOST":
      return {
        value: state['value'],
        hasFocus: false
      }
  }

  return state
}
