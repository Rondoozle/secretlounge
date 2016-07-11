import dude from 'debug-dude'
const { /*debug,*/ log, info, warn /*, error*/ } = dude('bot')

import { version } from '../package.json'
info(`secretlounge v${version} starting`)

import config from '../config.json'

import { connect } from 'coffea'
const networks = connect(config)

import {
  htmlMessage, cursive,
  getUsername, getUsernameFromEvent, getRealnameFromEvent,
  stringifyTimestamp,
  USER_NOT_IN_CHAT, USER_IN_CHAT, USER_BANNED_FROM_CHAT, USER_JOINED_CHAT,
  USER_SPAMMING
} from './messages'
import { RANKS } from './ranks'
import { setCache, delCache } from './cache'
import {
  getUser, getUsers, setRank, isActive, addUser, rejoinUser, updateUser,
  getSystemConfig
} from './db'
import commands from './commands'
import { HOURS } from './time'
import { SPAM_LIMIT, SPAM_LIMIT_HIT, SPAM_INTERVAL } from './constants'

const parseEvent = (rawEvent) => {
  if (typeof rawEvent === 'string') return { type: 'message', text: rawEvent }
  else return rawEvent
}

export const sendToUser = (id, rawEvent) => {
  const evt = parseEvent(rawEvent)
  networks.send({
    ...evt,
    chat: id
  })
}

export const sendToAll = (rawEvent) => {
  const evt = parseEvent(rawEvent)
  getUsers().map((user) => {
    if (user.debug || user.id !== evt.user) { // don't relay back to sender
      const eventToBeSent = {
        ...evt,
        chat: user.id,
        options: {
          ...evt.options,
          reply_to_message_id: evt && evt.raw && evt.raw.reply_to_message && evt.raw.reply_to_message.message_id
        }
      }
      const promises = networks.send(eventToBeSent)
      if (evt.user) {
        // store message in history
        promises && promises[0] && promises[0].then((msg) => {
          setCache(msg.message_id, { sender: evt.user })
          setTimeout(() => {
            delCache(msg.message_id)
          }, 24 * HOURS)
        })
        .catch((err) => {
          if (err && err.message !== '403 {"ok":false,"error_code":403,"description":"Bot was blocked by the user"}') {
            warn('message (%o) not sent to user (%o): %o', eventToBeSent, user, err)
          }
        })
      }
    }
  })
}

const relay = (type) => {
  networks.on(type, (evt, reply) => {
    if (type !== 'message' || (evt && evt.text && evt.text.charAt(0) !== '/')) { // don't parse commands again
      const user = getUser(evt.user)
      if (user.spamScore > SPAM_LIMIT) return reply(cursive(USER_SPAMMING))
      else increaseSpamScore(user)
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

const updateUserFromEvent = (evt) => {
  const user = getUser(evt.user)
  if (user) {
    if (evt && evt.raw && evt.raw.from) {
      return updateUser(user.id, {
        username: getUsernameFromEvent(evt),
        realname: getRealnameFromEvent(evt)
      })
    } else warn('user detected, but no `from` information in message!')
  }
}

const increaseSpamScore = (user) => {
  const newSpamScore =
    user.spamScore >= SPAM_LIMIT
    ? SPAM_LIMIT_HIT
    : user.spamScore + 1

  return updateUser(user.id, {
    spamScore: newSpamScore
  })
}

const decreaseSpamScores = () => {
  const users = getUsers()
  return users.map((user) => {
    return updateUser(user.id, {
      spamScore: user.spamScore - 1
    })
  })
}

setInterval(decreaseSpamScores, SPAM_INTERVAL)

const showChangelog = (evt, reply) => {
  const user = getUser(evt.user)
  if (user) {
    if (user.version !== version) {
      updateUser(user.id, { version })
      const tag = 'v' + version.split('-').shift()
      reply(htmlMessage(
        `<i>a new version has been released (</i><b>${version}</b><i>), ` +
        `check out</i> https://github.com/6697/secretlounge/releases/tag/${tag}`
      ))
    }
  }
}

networks.on('command', (evt, reply) => {
  log('received command event: %o', evt)

  const user = getUser(evt.user)
  if (evt && evt.cmd) evt.cmd = evt.cmd.toLowerCase()

  if (evt && evt.cmd === 'start') { // user (re)joining chat
    if (user && isActive(user)) return reply(cursive(USER_IN_CHAT))
    else if (user && user.banned >= Date.now()) {
      return reply(cursive(USER_BANNED_FROM_CHAT + ' until ' + stringifyTimestamp(user.banned)))
    }
    else if (user && (user.kicked || user.banned)) rejoinUser(evt.user)
    else addUser(evt.user)
    const newUser = updateUserFromEvent(evt)

    sendToAll(htmlMessage(
      `${getUsername(newUser)} <i>${USER_JOINED_CHAT}</i>`
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

networks.on('message', (evt, reply) => {
  updateUserFromEvent(evt)
  showChangelog(evt, reply)
})
