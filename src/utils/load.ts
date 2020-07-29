import fs from 'fs'

const load = (type: string) => {
  try {
    return JSON.parse(fs.readFileSync(`data/${type}.json`).toString())
  } catch (err) {
    if (err.code === 'ENOENT') {
      return {}
    }
  }
}

export default load
