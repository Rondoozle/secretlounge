import { getRank } from './ranks'

export const NOT_IN_CHAT = 'You\'re not in the chat yet! Use /start to join'

const parseValue = (val) => {
  if (typeof val === 'boolean') return val ? 'on' : 'off'
  else return val
}

export const htmlMessage = (msg) => {
  return {
    type: 'message',
    text: msg,
    options: {
      parse_mode: 'HTML'
    }
  }
}

export const configGet = (name, val) =>
  htmlMessage(`<i>${name}</i>: <code>${parseValue(val)}</code>`)

export const configSet = (name, val) =>
  htmlMessage(`set <i>${name}</i>: <code>${parseValue(val)}</code>`)

export const cursive = (msg) =>
  htmlMessage('<i>' + msg + '</i>')

export const generateSmiley = (warnings) => {
  if (!warnings || warnings <= 0) return ':)'
  else if (warnings === 1) return ':|'
  else if (warnings <= 3) return ':/'
  else if (warnings <= 5) return ':('
  else return `:'(`
}

const obfuscateId = (id) =>
  id.toString(32)

export const infoText = (user) => !user ? '<i>user not found</i>' :
  `<b>id:</b> ${obfuscateId(user.id)}, <b>username:</b> @${user.username}, ` +
  `<b>rank:</b> ${user.rank} (${getRank(user.rank)}), ` +
  `<b>warnings:</b> ${user.warnings || 0} ${generateSmiley(user.warnings)}`

export const modInfoText = (user) => !user ? '<i>user not found</i>' :
  `<b>id:</b> ${obfuscateId(user.id)}, <b>username:</b> anon, ` +
  `<b>rank:</b> ???, ` +
  `<b>warnings:</b> ${user.warnings || 0} ${generateSmiley(user.warnings)}`
