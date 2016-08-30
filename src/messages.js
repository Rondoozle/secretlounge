import { getRank } from './ranks'
import { DAYS } from './time'

export const USER_NOT_IN_CHAT = 'you\'re not in the chat yet! Use </i>/start<i> to join'
export const USER_IN_CHAT = 'you\'re already in the chat!'
export const USER_BANNED_FROM_CHAT = 'you\'re banned from this chat'
export const USER_LEFT_CHAT = 'left the chat'
export const USER_JOINED_CHAT = 'joined the chat'
export const USER_SPAMMING = 'your recent messages have been deemed spammy, if this is a false positive contact @omnidan or @hdrive'

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

const idSalt = () =>
  Math.floor(Date.now() / DAYS)

const obfuscateId = (id) =>
  Math.floor((id / idSalt()) * 100000).toString(32)

export const getUsername = (user) => {
  const rank = user.rank > 0 ? ' (' + getRank(user.rank) + ')' : ''
  return (user.username ? '@' + user.username : user.realname) + rank
}

export const getRealnameFromEvent = (evt) => {
  if (evt && evt.raw && evt.raw.from) {
    const { first_name, last_name } = evt.raw.from
    return [first_name, last_name].filter(i => i).join(' ')
  }
}

export const getUsernameFromEvent = (evt) => {
  if (evt && evt.raw && evt.raw.from) {
    return evt.raw.from.username
  }
}

export const stringifyTimestamp = (ts) =>
  (new Date(ts)).toUTCString()

export const usersText = (users) =>
  `<b>${users.length}</b> <i>users:</i> ` + users.map(getUsername).join(', ')

export const infoText = (user) => !user ? '<i>user not found</i>' :
  `<b>id:</b> ${obfuscateId(user.id)}, <b>username:</b> @${user.username}, ` +
  `<b>rank:</b> ${user.rank} (${getRank(user.rank)}), ` +
  `<b>warnings:</b> ${user.warnings || 0} ${generateSmiley(user.warnings)}, ` +
  `<b>kicked:</b> ${user.kicked ? 'yes' : 'no'}, <b>banned:</b> ${user.banned ? stringifyTimestamp(user.banned) : 'no'}`

export const modInfoText = (user) => !user ? '<i>user not found</i>' :
  `<b>id:</b> ${obfuscateId(user.id)}, <b>username:</b> anon, ` +
  `<b>rank:</b> ???, ` +
  `<b>warnings:</b> ${user.warnings || 0} ${generateSmiley(user.warnings)}, ` +
  `<b>kicked:</b> ${user.kicked ? 'yes' : 'no'}, <b>banned:</b> ${user.banned ? stringifyTimestamp(user.banned) : 'no'}`
