import { SECONDS } from './time'

export const LINK_REGEX = /(https?:\/\/)?[A-Za-z0-9-_]\.[A-Za-z]/g

export const SPAM_LIMIT = 3 // score / messages
export const SPAM_LIMIT_HIT = 5 // set score to this when limit is reached
export const SPAM_INTERVAL = 5 * SECONDS // interval to decrease scores

export const SCORE_MESSAGE = 1 // score per message sent
export const SCORE_LINK = 0.5  // score per message link
export const SCORE_CHARACTER = 0.01 // score per message character
export const SCORE_STICKER = 1.5 // score per sticker
