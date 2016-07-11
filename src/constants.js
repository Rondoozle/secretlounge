import { SECONDS } from './time'

export const SPAM_LIMIT = 3 // score / messages
export const SPAM_LIMIT_HIT = 5 // set score to this when limit is reached
export const SPAM_INTERVAL = 5 * SECONDS // interval to decrease scores
