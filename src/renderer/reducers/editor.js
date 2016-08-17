let initialState = {
  value: `def some_function():
  a = 5
def another_function():
  return "foo"`,
  hasFocus: true,
  history: []
}

export default function editor(state=initialState, action) {
  switch (action.type) {
    case "EDITOR_UPDATE":
      return {
        value: action['value'],
        history: state['history'],
        hasFocus: true
      }
    case "EDITOR_CHANGES":
      return {
        value: action['value'],
        history: state['history'].concat(
          {
            from: action.from,
            to: action.to,
            text: action.text,
            removed: action.removed,
            origin: action.origin
          }
        ),
        hasFocus: true
      }
    case "FOCUS":
      return {
        value: state['value'],
        history: state['history'],
        hasFocus: true
      }
    case "FOCUS_LOST":
      return {
        value: state['value'],
        history: state['history'],
        hasFocus: false
      }
  }

  return state
}
