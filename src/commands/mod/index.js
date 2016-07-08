import { sendToAll } from '../../index'
import {
  cursive, htmlMessage,
  modInfoText
} from '../../messages'
import { getFromCache } from '../../cache'
import {
  getUserByUsername, getUser,
  warnUser, kickUser, banUser
} from '../../db'
import { RANKS } from '../../ranks'

export default function modCommands (user, evt, reply) {
  let messageRepliedTo

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

    case 'modsay':
      if (evt.args.length <= 0) return reply(cursive('please specify a message, e.g. /modsay message'))
      sendToAll(htmlMessage('<i>the </i><b>mods</b><i> shout from the heavens:</i> ' + evt.args.join(' ')))
      break

    case 'info':
      if (evt && evt.raw && evt.raw.reply_to_message) {
        messageRepliedTo = getFromCache(evt, reply)
        if (messageRepliedTo) {
          const user = getUser(messageRepliedTo.sender)
          reply(htmlMessage(
            modInfoText(user)
          ))
        }
      }
      break

    case 'warn':
      messageRepliedTo = getFromCache(evt, reply)
      const warnResult = warnUser(messageRepliedTo.sender)
      reply(htmlMessage('<i>warned user, has</i> <b>' + warnResult.warnings + '</b> <i>warnings now</i>'))
      break

    case 'kick':
      messageRepliedTo = getFromCache(evt, reply)
      const kickResult = warnUser(messageRepliedTo.sender)
      kickUser(messageRepliedTo.sender)
      reply(htmlMessage('<i>kicked user, has</i> <b>' + kickResult.warnings + '</b> <i>warnings now</i>'))
      break

    case 'ban':
      messageRepliedTo = getFromCache(evt, reply)
      const repliedToUser = getUser(messageRepliedTo.sender)
      if (repliedToUser.rank >= RANKS.user) return reply(cursive('you can\'t ban mods or admins'))

      const banResult = warnUser(messageRepliedTo.sender)
      kickUser(messageRepliedTo.sender)
      banUser(messageRepliedTo.sender)
      reply(htmlMessage('<i>banned user, has</i> <b>' + banResult.warnings + '</b> <i>warnings now</i>'))
      break
  }
}
