let initialState = {
  value: `def some_function():
  a = 5
def another_function():
  return "foo"`
}

export default function editor(state=initialState, action) {
  switch (action.type) {
    case "EDITOR_UPDATE":
      return {
        value: action['value']
      }
  }

  return state
}
