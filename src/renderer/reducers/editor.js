function updateText(state, action) {
  if (action.type == "EDITOR_UPDATE_TEXT") {
    return Object.assign({}, action.text)
  }
}
