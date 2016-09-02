import { sendToAll } from '../../index'
import {
  cursive, htmlMessage,
  getUsername,
  infoText, configSet, usersText,
  USER_NOT_IN_CHAT, USER_LEFT_CHAT
} from '../../messages'
import { kickUser, getUsers, getSystemConfig, setDebugMode } from '../../db'
import { version } from '../../../package.json'

export default function userCommands (user, evt, reply) {
  switch (evt.cmd) {
    case 'modhelp':
      reply(htmlMessage(`
<i>you can use the following commands:</i>
  /modhelp - show this info
  /modsay [message] - send an official moderator message

<i>or reply to a message and use:</i>
  /info - to get info about the user that sent this message
  /warn - to warn the user that sent this message
  /kick - to kick the user that sent this message
  /ban - to ban the user that sent this message`))
      break

    case 'adminhelp':
      reply(htmlMessage(`
<i>you can use the following commands:</i>
  /adminhelp - show this info
  /adminsay [message] - send an official moderator message
  /motd [message] - set the message of the day
  /mod [username] - grant a user moderator rank
  /admin [username] - grand a user admin rank`))
      break

    case 'stop':
      if (user.kicked) return reply(cursive(USER_NOT_IN_CHAT))
      kickUser(evt.user)
      sendToAll(htmlMessage(
        `${getUsername(user)} <i>${USER_LEFT_CHAT}</i>`
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
    case 's':
      reply(cursive('this command has been disabled'))
      break

    case 'debug':
      const newDebugMode = !user.debug
      setDebugMode(evt.user, newDebugMode)
      reply(configSet('debug mode', newDebugMode))
      break

    case 'source':
    case 'version':
      const tag = 'v' + version.split('-').shift()
      reply(`secretlounge v${version} - https://github.com/6697/secretlounge`)
      reply(`changelog: https://github.com/6697/secretlounge/releases/tag/${tag}`)
      break

    case 'changelog':
      reply('you can see the full changelog here: https://github.com/6697/secretlounge/releases')
      break

    case 'issues':
      reply('please report issues here: https://github.com/6697/secretlounge/issues')
      break
  }
}
