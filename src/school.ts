import School from 'school-kr'
import { help, meal, schedule, search, set } from './commands'
import { dateConvert, load, save } from './utils'

const school = new School()
const define = load('src/define.json')
const messages = load('src/messages.json')
const searches = {}

const index = async (type: string, channel: string, text: string, embed) => {
  if (text.includes('하나')) {
    help(text, embed, messages)
    await meal(text, channel, embed, type, school, dateConvert)
    await schedule(text, channel, embed, type, school)
    await search(text, embed, searches, school, define, channel)
    set(text, embed, searches, messages, channel, type, load, save)
  }

  return embed
}

export default index
