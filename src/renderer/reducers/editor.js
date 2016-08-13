let initialState = {
  value: `
# Initial Code

def some_function():
  a = 5

  `
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
