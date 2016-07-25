import low from 'lowdb'
const db = low('db.json')

import { version } from '../package.json'

db.defaults({ users: [], system: {} }).value()

export const getUser = (id) => db.get('users').find({ id }).value()
export const getUserByUsername = (username) => db.get('users').find({ username }).value()
export const addUser = (id) => db.get('users').push({ id, rank: 0, version }).value()
export const rejoinUser = (id) => db.get('users').find({ id }).assign({ kicked: false, banned: false }).value()
export const delUser = (id) => db.get('users').remove({ id }).value()
export const getUsers = () => db.get('users').value()
export const updateUser = (id, data) => db.get('users').find({ id }).assign(data).value()

const getUserWarnings = (id) => {
  const user = getUser(id)
  if (!user || !user.warnings) return 0
  else return user.warnings
}

import { HOURS } from './time'

export const warnUser = (id) => db.get('users').find({ id }).assign({ warnings: getUserWarnings(id) + 1 }).value()
export const kickUser = (id) => db.get('users').find({ id }).assign({ kicked: true }).value()
export const banUser = (id) =>
  db.get('users')
    .find({ id })
    .assign({ banned: Date.now() + (24 * HOURS) })
    .value()

export const isActive = (user) => user && !user.kicked && !user.banned

export const setRank = (id, rank) => db.get('users').find({ id }).assign({ rank }).value()
export const setDebugMode = (id, val) => db.get('users').find({ id }).assign({ debug: val }).value()

export const getSystemConfig = () => db.get('system').value()
export const setMotd = (motd) => db.get('system').assign({ motd }).value()
