import { cursive } from './messages'

// TODO: use a better caching method

let messageHistory = {}

export const getFromCache = (evt, reply) => {
  if (!evt || !evt.raw || !evt.raw.reply_to_message) {
    reply(cursive('please reply to a message to ban the user who posted it'))
    return false
  }

  const messageRepliedTo = messageHistory[evt.raw.reply_to_message.message_id]
  if (!messageRepliedTo) {
    reply(cursive('sender not found in cache (it\'s been more than 24h or the bot has been restarted since the post)'))
    return false
  }

  return messageRepliedTo
}

export const setCache = (id, data) => {
  messageHistory[id] = data
}

export const delCache = (id) => {
  delete messageHistory[id]
}
