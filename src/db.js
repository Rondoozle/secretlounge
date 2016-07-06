import low from 'lowdb'
const db = low('db.json')

db.defaults({ users: [], system: {} }).value()

export const getUser = (id) => db.get('users').find({ id }).value()
export const getUserByUsername = (username) => db.get('users').find({ username }).value()
export const addUser = (id, username) => db.get('users').push({ id, username, rank: 0 }).value()
export const delUser = (id) => db.get('users').remove({ id }).value()
export const getUsers = () => db.get('users').value()

export const setRank = (id, rank) => db.get('users').find({ id }).assign({ rank }).value()
export const setDebugMode = (id, val) => db.get('users').find({ id }).assign({ debug: val }).value()

export const getSystemConfig = () => db.get('system').value()
export const setMotd = (motd) => db.get('system').assign({ motd }).value()
