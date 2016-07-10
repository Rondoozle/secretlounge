import dude from 'debug-dude'
const { /*debug, log,*/ info /*, warn, error*/ } = dude('bot:commands:admin')

import { sendToAll } from '../../index'
import {
  cursive, htmlMessage,
  configSet
} from '../../messages'
import { setMotd, setRank, getUserByUsername } from '../../db'
import { RANKS } from '../../ranks'

export default function adminCommands (user, evt, reply) {
  switch (evt.cmd) {
    case 'motd':
      const motd = evt.args.join(' ')
      if (motd) {
        setMotd(motd)
        info('%o set motd -> %s', user, motd)
        reply(configSet('message of the day', motd))
      }
      break

    case 'mod':
      if (evt.args.length !== 1) return reply(htmlMessage('<i>please specify a username, e.g.</i> /mod username'))
      const newMod = getUserByUsername(evt.args[0])
      setRank(newMod.id, RANKS.mod)
      info('%o made %o mod', user, newMod)
      reply(htmlMessage(`<i>made</i> @${evt.args[0]} <i>a moderator</i>`))
      break

    case 'admin':
      if (evt.args.length !== 1) return reply(htmlMessage('<i>please specify a username, e.g.</i> /admin username'))
      const newAdmin = getUserByUsername(evt.args[0])
      setRank(newAdmin.id, RANKS.admin)
      info('%o made %o admin', user, newAdmin)
      reply(htmlMessage(`<i>made</> @${evt.args[0]} <i>an admin</i>`))
      break

    case 'adminsay':
      if (evt.args.length <= 0) return reply(htmlMessage('<i>please specify a message, e.g. </i>/adminsay message'))
      info('%o sent admin message -> %s', user, evt.args.join(' '))
      sendToAll(htmlMessage('<i>the </i><b>admins</b><i> shout from the heavens:</i> ' + evt.args.join(' ')))
      break
  }
}
