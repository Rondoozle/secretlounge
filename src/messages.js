export const NOT_IN_CHAT = 'You\'re not in the chat yet! Use /start to join'

const parseValue = (val) => {
  if (typeof val === 'boolean') return val ? 'on' : 'off'
  else return val
}

export const configSet = (evt, name, val) => {
  return {
    type: 'message',
    user: evt.user,
    text: `set <i>${name}</i>: <code>${parseValue(val)}</code>`,
    options: {
      parse_mode: 'HTML'
    }
  }
}

export const configGet = (evt, name, val) => {
  return {
    type: 'message',
    user: evt.user,
    text: `<i>${name}</i>: <code>${parseValue(val)}</code>`,
    options: {
      parse_mode: 'HTML'
    }
  }
}
