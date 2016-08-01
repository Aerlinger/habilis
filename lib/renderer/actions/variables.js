const ADD_VARIABLE = "ADD_VARIABLE"
const UPDATE_VARIABLE = "UPDATE_VARIABLE"
const REMOVE_VARIABLE = "REMOVE_VARIABLE"
const CLEAR_VARIABLES = "CLEAR_VARIABLES"

export function addVariable(name, dataType, description) {
  return {
    type: ADD_VARIABLE,
    name,
    dataType,
    description
  }
}

export function updateVariable(name, dataType, description) {
  return {
    type: ADD_VARIABLE,
          name,
          dataType,
          description
  }
}

export function removeVariable(variableName) {
  return {
    type: REMOVE_VARIABLE,
    variableName
  }
}

export function clearVariables() {
  return {
    type: CLEAR_VARIABLES
  }
}
