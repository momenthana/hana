import fs from 'fs'
import path from 'path'

const save = (filePath: string, data: object) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
  } catch (err) {
    if (err.code === 'ENOENT') {
      fs.mkdirSync(path.dirname(filePath))
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    }
  }
}

export default save
