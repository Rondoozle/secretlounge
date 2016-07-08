import { cursive } from './messages'

// TODO: this doesn't work in production mode

let messageHistory = {}

export const getFromCache = (evt, reply) => {
  if (!evt || !evt.raw || !evt.raw.reply_to_message) return reply(cursive('please reply to a message to ban the user who posted it'))

  const messageRepliedTo = messageHistory[evt.raw.reply_to_message.message_id]
  if (!messageRepliedTo) return reply(cursive('sender not found in cache (it\'s been more than 24h or the bot has been restarted since the post)'))

  return messageRepliedTo
}

export const setCache = (id, data) => {
  messageHistory[id] = data
}

export const delCache = (id) => {
  delete messageHistory[id]
}
