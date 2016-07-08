import { sendToAll } from '../../index'
import {
  cursive, htmlMessage,
  configSet
} from '../../messages'
import { setMotd, setRank, getUserByUsername } from '../../db'
import { RANKS } from '../../ranks'

export default function adminCommands (user, evt, reply) {
  switch (evt.cmd) {
    case 'adminhelp':
      reply(htmlMessage(`
<i>you can use the following commands:</i>
  /adminhelp - show this info
  /adminsay [message] - send an official moderator message
  /motd [message] - set the message of the day
  /mod [username] - grant a user moderator rank
  /admin [username] - grand a user admin rank`))
      break

    case 'motd':
      const motd = evt.args.join(' ')
      if (motd) {
        setMotd(motd)
        reply(configSet('message of the day', motd))
      }
      break

    case 'mod':
      if (evt.args.length !== 1) return reply(htmlMessage('<i>please specify a username, e.g.</i> /mod username'))
      setRank(getUserByUsername(evt.args[0]).id, RANKS.mod)
      reply(htmlMessage(`<i>made</i> @${evt.args[0]} <i>a moderator</i>`))
      break

    case 'admin':
      if (evt.args.length !== 1) return reply(htmlMessage('<i>please specify a username, e.g.</i> /admin username'))
      setRank(getUserByUsername(evt.args[0]).id, RANKS.admin)
      reply(htmlMessage(`<i>made</> @${evt.args[0]} <i>an admin</i>`))
      break

    case 'adminsay':
      if (evt.args.length <= 0) return reply(htmlMessage('<i>please specify a message, e.g. </i>/adminsay message'))
      sendToAll(htmlMessage('<i>the </i><b>admins</b><i> shout from the heavens:</i> ' + evt.args.join(' ')))
      break
  }
}
