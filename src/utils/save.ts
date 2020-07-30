import fs from 'fs'
import path from 'path'

const save = (filePath: string, data: object) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data))
  } catch (err) {
    if (err.code === 'ENOENT') {
      fs.mkdirSync(path.dirname(filePath))
      fs.writeFileSync(filePath, JSON.stringify(data))
    }
  }
}

export default save
