import fs from 'fs'

const save = (type: string, data: object) => {
  try {
    fs.writeFileSync(`data/${type}.json`, JSON.stringify(data))
  } catch {
    fs.mkdirSync('data')
    fs.writeFileSync(`data/${type}.json`, JSON.stringify(data))
  }
}

export default save
