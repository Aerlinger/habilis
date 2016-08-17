export function onChange(value) {
  return {
    type: "EDITOR_UPDATE",
          value
  }
}

export function onChanges(from, to, text, removed, origin) {
  return {
    type: "EDITOR_CHANGES",
          from,
          to,
          text,
          removed,
          origin
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
