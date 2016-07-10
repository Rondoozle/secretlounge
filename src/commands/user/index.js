import { sendToAll } from '../../index'
import {
  cursive, htmlMessage,
  getUsernameFromEvent,
  infoText, configSet, usersText,
  USER_NOT_IN_CHAT, USER_LEFT_CHAT
} from '../../messages'
import { delUser, getUsers, getSystemConfig, setDebugMode } from '../../db'
import { version } from '../../../package.json'

export default function userCommands (user, evt, reply) {
  switch (evt.cmd) {
    case 'stop':
      if (!user) return reply(cursive(USER_NOT_IN_CHAT))
      delUser(evt.user)
      sendToAll(htmlMessage(
        `@${getUsernameFromEvent(evt)} <i>${USER_LEFT_CHAT}</i>`
      ))
      break

    case 'users':
      const users = getUsers()
      reply(htmlMessage(
        usersText(users)
      ))
      break

    case 'info':
      const isReply = evt && evt.raw && evt.raw.reply_to_message
      if (!isReply && evt.args.length === 0) {
        reply(htmlMessage(
          infoText(user)
        ))
      }
      break

    case 'motd':
      const motd = evt.args.join(' ')
      if (!motd) {
        reply(cursive(getSystemConfig().motd))
      }
      break

    case 'sign':
      sendToAll({
        type: 'message',
        user: evt.user,
        text: '<b> ~' + getUsernameFromEvent(evt) + '</b>',
        options: {
          parse_mode: 'HTML'
        }
      })
      break

    case 'debug':
      const newDebugMode = !user.debug
      setDebugMode(evt.user, newDebugMode)
      reply(configSet('debug mode', newDebugMode))
      break

    case 'source':
    case 'version':
      reply(`secretlounge v${version} - https://github.com/6697/secretlounge`)
      break

    case 'issues':
      reply('please report issues here: https://github.com/6697/secretlounge/issues')
      break
  }
}
