import { cursive } from './messages'

// TODO: use a better caching method

let messageHistory = {}
let messageGroups = { length: 0 }

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

export const setCache = (id, cacheId, sender, receiver) => {
  // add to history
  messageHistory[id] = { sender, cacheId }

  // add to message group
  messageGroups[cacheId][receiver] = id
}

export const createCacheGroup = () => {
  const cacheId = messageGroups.length
  messageGroups[cacheId] = {}
  messageGroups.length++
  return cacheId
}

export const getCacheGroup = (id) => {
  const { cacheId } = messageHistory[id]
  return messageGroups[cacheId]
}

export const delCache = (id) => {
  // remove message group
  const { cacheId } = messageHistory[id]
  delete messageGroups[cacheId]
  messageGroups.length--

  // remove message from history
  delete messageHistory[id]
}
