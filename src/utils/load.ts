import fs from 'fs'

const load = (filePath: string) => {
  try {
    return JSON.parse(fs.readFileSync(filePath).toString())
  } catch (err) {
    if (err.code === 'ENOENT') {
      return {}
    }
  }
}

export default load
