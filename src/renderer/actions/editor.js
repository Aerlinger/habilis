export function onChange(value) {
  return {
    type: "EDITOR_UPDATE",
          value
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
