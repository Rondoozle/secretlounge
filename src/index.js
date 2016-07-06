import dude from 'debug-dude'
const { /*debug,*/ log, info /*, warn, error*/ } = dude('bot')

import { version } from '../package.json'
info(`secretlounge v${version} starting`)

import config from '../config.json'

import { connect } from 'coffea'
const networks = connect(config)

import {
  getUser, getUserByUsername, addUser, delUser, getUsers,
  setRank, setDebugMode,
  getSystemConfig, setMotd
} from './db'
import { NOT_IN_CHAT, configSet, configGet, cursive, htmlMessage } from './messages'
import { RANKS, getRank } from './ranks'

const sendToAll = (rawEvent) => {
  let evt
  if (typeof rawEvent === 'string') evt = { type: 'message', text: rawEvent }
  else evt = rawEvent

  getUsers().map((user) => {
    if (user.debug || user.id !== evt.user) { // don't relay back to sender
      networks.send({ ...evt, chat: user.id })
    }
  })
}

const relay = (type) => {
  networks.on(type, (evt, reply) => {
    if (type !== 'message' || (evt && evt.text && evt.text.charAt(0) !== '/')) { // don't parse commands again
      if (getUser(evt.user)) { // make sure user is in the group chat
        // otherwise, relay event to all users
        sendToAll(evt)
      } else {
        reply(NOT_IN_CHAT)
      }
    }
  })
}

['message', 'audio', 'document', 'photo', 'sticker', 'video', 'voice'].map(relay)

const getUsername = (user) => {
  const rank = user.rank > 0 ? ' (' + getRank(user.rank) + ')' : ''
  return '@' + user.username + rank
}

const getUsernameFromEvent = (evt) => evt.raw && evt.raw.from && evt.raw.from.username

const adminCommands = (cmd, evt, reply) => {
  switch (cmd) {
    case 'motd':
      const motd = evt.args.join(' ')
      if (!motd) reply(configGet('message of the day', getSystemConfig().motd))
      else {
        setMotd(motd)
        reply(configSet('message of the day', motd))
      }
      break
    case 'mod':
      if (evt.args.length !== 1) return reply(cursive('please specify a username, e.g. /mod username'))
      setRank(getUserByUsername(evt.args[0]).id, RANKS.mod)
      reply(htmlMessage(`<i>made</i> @${evt.args[0]} <i>a moderator</i>`))
      break
    case 'admin':
      if (evt.args.length !== 1) return reply(cursive('please specify a username, e.g. /admin username'))
      setRank(getUserByUsername(evt.args[0]).id, RANKS.admin)
      reply(htmlMessage(`<i>made</> @${evt.args[0]} <i>an admin</i>`))
      break
    case 'adminsay':
      if (evt.args.length <= 0) return reply(cursive('please specify a message, e.g. /adminsay message'))
      sendToAll(htmlMessage('<i>the </i><b>admins</b><i> shout from the heavens:</i> ' + evt.args.join(' ')))
  }
}

const modCommands = (cmd, evt, reply) => {
  switch (cmd) {
    case 'modsay':
      if (evt.args.length <= 0) return reply(cursive('please specify a message, e.g. /modsay message'))
      sendToAll(htmlMessage('<i>the </i><b>mods</b><i> shout from the heavens:</i> ' + evt.args.join(' ')))
    // case 'ban':
    //   // TODO: make this accessible by replying to one of the bots messages and doing /ban
  }
}

const commands = (cmd, evt, reply) => {
  const user = getUser(evt.user)

  switch (cmd) {
    case 'stop':
      if (!getUser(evt.user)) reply(NOT_IN_CHAT)
      else delUser(evt.user)
      sendToAll({
        type: 'message',
        user: evt.user,
        text: '@' + getUsernameFromEvent(evt) + ' <i>left the chat</i>',
        options: {
          parse_mode: 'HTML'
        }
      })
      break
    case 'users':
      const users = getUsers()
      reply(users.length + ' users: ' + users.map(getUsername).join(', '))
      break
    case 'info':
      reply({
        type: 'message',
        user: evt.user,
        text: `<b>id:</b> ${user.id}, <b>username:</b> @${user.username}, <b>rank:</b> ${user.rank} (${getRank(user.rank)})`,
        options: {
          parse_mode: 'HTML'
        }
      })
      break
    case 'debug':
      const newDebugMode = !user.debug
      setDebugMode(evt.user, newDebugMode)
      reply(configSet('debug mode', newDebugMode))
  }
}

networks.on('command', (evt, reply) => {
  log('Received command event: %o', evt)

  const cmd = evt.cmd.toLowerCase()

  if (cmd === 'start') {
    if (getUser(evt.user)) return reply('You\'re already in the chat!')
    else {
      const username = getUsernameFromEvent(evt)
      addUser(evt.user, username)
      sendToAll({
        type: 'message',
        user: evt.user,
        text: '@' + username + ' <i>joined the chat</i>',
        options: {
          parse_mode: 'HTML'
        }
      })

      // make first user admin
      if (getUsers().length === 1) setRank(evt.user, RANKS.admin)

      const motd = getSystemConfig().motd
      if (motd) reply(motd)
    }
  } else {
    const user = getUser(evt.user)
    if (!user) return reply(NOT_IN_CHAT)
    commands(cmd, evt, reply)
    if (user.rank >= RANKS.mod) modCommands(cmd, evt, reply)
    if (user.rank >= RANKS.admin) adminCommands(cmd, evt, reply)
  }
})
