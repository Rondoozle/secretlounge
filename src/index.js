import dude from 'debug-dude'
const { /*debug,*/ log, info, warn /*, error*/ } = dude('bot')

import { version } from '../package.json'
info(`secretlounge v${version} starting`)

import config from '../config.json'

import { connect } from 'coffea'
const networks = connect(config)

import {
  htmlMessage, cursive,
  getUsernameFromEvent,
  USER_NOT_IN_CHAT, USER_IN_CHAT, USER_BANNED_FROM_CHAT, USER_JOINED_CHAT
} from './messages'
import { RANKS } from './ranks'
import { setCache, delCache } from './cache'
import {
  getUser, getUsers, setRank, isActive, addUser, rejoinUser,
  getSystemConfig
} from './db'
import commands from './commands'

const SECONDS = 1000
const MINUTES = 60 * SECONDS
const HOURS = 60 * MINUTES

export const sendToAll = (rawEvent) => {
  let evt
  if (typeof rawEvent === 'string') evt = { type: 'message', text: rawEvent }
  else evt = rawEvent

  getUsers().map((user) => {
    if (user.debug || user.id !== evt.user) { // don't relay back to sender
      const promises = networks.send({ ...evt, chat: user.id })
      if (evt.user) {
        // store message in history
        promises && promises[0] && promises[0].then((msg) => {
          setCache(msg.message_id, { sender: evt.user })
          setTimeout(() => {
            delCache(msg.message_id)
          }, 24 * HOURS)
        })
        .catch((err) => warn('message not sent: %o', err))
      }
    }
  })
}

const relay = (type) => {
  networks.on(type, (evt, reply) => {
    if (type !== 'message' || (evt && evt.text && evt.text.charAt(0) !== '/')) { // don't parse commands again
      const user = getUser(evt.user)
      if (user && isActive(user)) { // make sure user is in the group chat
        // otherwise, relay event to all users
        sendToAll(evt)
      } else {
        reply(cursive(USER_NOT_IN_CHAT))
      }
    }
  })
}

['message', 'audio', 'document', 'photo', 'sticker', 'video', 'voice'].map(relay)

networks.on('command', (evt, reply) => {
  log('received command event: %o', evt)

  const user = getUser(evt.user)
  if (evt && evt.cmd) evt.cmd = evt.cmd.toLowerCase()

  if (evt && evt.cmd === 'start') { // user (re)joining chat
    if (user && isActive(user)) return reply(cursive(USER_IN_CHAT))
    else if (user && user.banned) return reply(cursive(USER_BANNED_FROM_CHAT))
    else if (user && user.kicked) rejoinUser(evt.user)
    else addUser(evt.user, getUsernameFromEvent(evt))

    sendToAll(htmlMessage(
      `@${getUsernameFromEvent(evt)} <i>${USER_JOINED_CHAT}</i>`
    ))

    // make first user admin
    if (getUsers().length === 1) setRank(evt.user, RANKS.admin)

    const motd = getSystemConfig().motd
    if (motd) reply(cursive(motd))
  } else {
    if (!user) return reply(cursive(USER_NOT_IN_CHAT))

    commands(user, evt, reply)
  }
})
