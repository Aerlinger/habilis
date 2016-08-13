let initialState = {
  value: "# Initial Code"
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
