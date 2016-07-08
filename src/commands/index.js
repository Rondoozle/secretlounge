import { RANKS } from '../ranks'

import userCommands from './user'
import modCommands from './mod'
import adminCommands from './admin'

export default function commands (user, evt, reply) {
  userCommands(user, evt, reply)
  if (user.rank >= RANKS.mod) modCommands(user, evt, reply)
  if (user.rank >= RANKS.admin) adminCommands(user, evt, reply)
}
