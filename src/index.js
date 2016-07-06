import dude from 'debug-dude'
const { /*debug,*/ log, info /*, warn, error*/ } = dude('bot')

import { version } from '../package.json'
info(`/b/ v${version} starting`)

import config from '../config.json'

import { connect } from 'coffea'
const networks = connect(config)

import { getUser, addUser, delUser, getUsers } from './db'

const relay = (type) => {
  networks.on(type, (evt, reply) => {
    if (evt.text.charAt(0) !== '/') { // don't parse commands again
      if (getUser(evt.user)) { // make sure user is in the group chat
        // otherwise, relay message to all users
        getUsers().map((user) => {
          if (config.debug || user.id !== evt.user) { // don't relay back to sender
            networks.send({ ...evt, chat: user.id })
          }
        })
      } else {
        reply('You\'re not chatting in /b/ yet! Use /start')
      }
    }
  })
}

['message', 'audio', 'document', 'photo', 'sticker', 'video', 'voice'].map(relay)

const getUsername = (user) => user.username

const commands = (cmd, evt, reply) => {
  switch (cmd) {
    case 'stop':
      if (!getUser(evt.user)) reply('You\'re not chatting in /b/ yet! Use /start')
      else delUser(evt.user)
      break
    case 'users':
      const users = getUsers()
      reply(users.length + ' users: ' + users.map(getUsername).join(', '))
      break
  }
}

networks.on('command', (evt, reply) => {
  log('Received command event: %o', evt)

  const cmd = evt.cmd.toLowerCase()

  if (cmd === 'start') {
    if (getUser(evt.user)) return reply('You\'re already chatting in /b/!')
    else {
      addUser(evt.user, evt.raw && evt.raw.from && evt.raw.from.username)
      return reply('Welcome to /b/!')
    }
  } else {
    if (!getUser(evt.user)) return reply('You\'re not chatting in /b/ yet! Use /start')
    commands(cmd, evt, reply)
  }
})
