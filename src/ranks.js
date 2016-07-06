export const RANKS = {
  'user': 0,
  'mod': 10,
  'admin': 100
}

export const getRank = (num) => {
  if (num < 0) return 'banned'
  else {
    let foundRank
    for (let rank of Object.keys(RANKS)) {
      const rankNum = RANKS[rank]
      if (num >= rankNum) foundRank = rank
      else return foundRank
    }
    return foundRank
  }
}
