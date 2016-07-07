import dude from 'debug-dude'
const { /*debug,*/ log, info, warn /*, error*/ } = dude('bot')

import { version } from '../package.json'
info(`secretlounge v${version} starting`)

import config from '../config.json'

import { connect } from '../../../caffeinery/coffea/src/index'
import telegram from '../../../caffeinery/coffea-telegram/src/index'
const networks = connect({
  "protocol": telegram,
  "token": "163546282:AAE_d45ZYlB-eOTyHq9Ouqd5-K4WsRoDKtA"
})

import {
  getUser, getUserByUsername, addUser, delUser, getUsers,
  setRank, setDebugMode, warnUser,
  getSystemConfig, setMotd
} from './db'
import {
  NOT_IN_CHAT,
  configSet, configGet,
  cursive, htmlMessage,
  generateSmiley, infoText, modInfoText
} from './messages'
import { RANKS, getRank } from './ranks'

let messageHistory = {} // TODO: add messages to history and link them to the users that posted them

const SECONDS = 1000
const MINUTES = 60 * SECONDS
const HOURS = 60 * MINUTES

const sendToAll = (rawEvent) => {
  let evt
  if (typeof rawEvent === 'string') evt = { type: 'message', text: rawEvent }
  else evt = rawEvent

  getUsers().map((user) => {
    if (user.debug || user.id !== evt.user) { // don't relay back to sender
      const promises = networks.send({ ...evt, chat: user.id }) // TODO: return message id and store in history here
      if (evt.user) {
        // store message in history
        promises && promises[0] && promises[0].then((msg) => {
          messageHistory[msg.message_id] = { sender: evt.user }
          console.log('storing', msg.message_id, '->', messageHistory[msg.message_id])
          setTimeout(() => {
            delete messageHistory[msg.message_id]
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
      break
  }
}

const getFromCache = (evt, reply) => {
  if (!evt || !evt.raw || !evt.raw.reply_to_message) return reply(cursive('please reply to a message to ban the user who posted it'))

  const messageRepliedTo = messageHistory[evt.raw.reply_to_message.message_id]
  if (!messageRepliedTo) return reply(cursive('sender not found in cache (it\'s been more than 24h or the bot has been restarted since the post)'))

  return messageRepliedTo
}

const modCommands = (cmd, evt, reply) => {
  let messageRepliedTo // TODO: put every command into a separate function
  switch (cmd) {
    case 'modsay':
      if (evt.args.length <= 0) return reply(cursive('please specify a message, e.g. /modsay message'))
      sendToAll(htmlMessage('<i>the </i><b>mods</b><i> shout from the heavens:</i> ' + evt.args.join(' ')))
      break
    case 'info':
      if (evt && evt.raw && evt.raw.reply_to_message) {
        messageRepliedTo = getFromCache(evt, reply)
        if (!messageRepliedTo) {
          if (evt.args.length >= 1) {
            reply({
              type: 'message',
              text: infoText(getUserByUsername(evt.args[0])),
              options: {
                parse_mode: 'HTML'
              }
            })
          }
        } else {
          const user = getUser(messageRepliedTo.sender)
          reply({
            type: 'message',
            text: modInfoText(user),
            options: {
              parse_mode: 'HTML'
            }
          })
        }
      }
      break
    case 'warn':
      messageRepliedTo = getFromCache(evt, reply)
      const result = warnUser(messageRepliedTo.sender)
      reply(htmlMessage('<i>warned user, has</i> <b>' + result.warnings + '</b> <i>warnings now</i>'))
      // TODO: also kick user here
      break
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
      if (!(evt && evt.raw && evt.raw.reply_to_message) && evt.args.length === 0) {
        reply({
          type: 'message',
          user: evt.user,
          text: infoText(user),
          options: {
            parse_mode: 'HTML'
          }
        })
      }
      break
    case 'debug':
      const newDebugMode = !user.debug
      setDebugMode(evt.user, newDebugMode)
      reply(configSet('debug mode', newDebugMode))
      break
    case 'source':
      reply('https://github.com/6697/secretlounge')
      break
    case 'issues':
      reply('Please report issues here: https://github.com/6697/secretlounge/issues')
      break
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
