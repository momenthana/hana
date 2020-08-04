import School from 'school-kr'
import { help, meal, schedule, search, set } from './commands'

const school = new School()
const searches = {}

const index = async (type: string, channel: string, text: string, embed) => {
  if (text.includes('하나')) {
    help(text, embed)
    await meal(text, channel, embed, type, school)
    await schedule(text, channel, embed, type, school)
    await search(text, channel, embed, school, searches)
    set(text, channel, embed, type, searches)
  }

  return embed
}

export default index
