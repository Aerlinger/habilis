export function onChange(value) {
  return {
    type: "EDITOR_UPDATE",
          value
  }
}

export function onChanges(cm, ...changes) {
  return {
    type: "EDITOR_CHANGES",
          changes
  }
}

export function onFocus() {
  return {
    type: "FOCUS"
  }
}

export function onBlur() {
  return {
    type: "FOCUS_LOST"
  }
}
