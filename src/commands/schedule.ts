import School from 'school-kr'
import { load } from '../utils'

const messages = load('src/messages.json')

const schedule = async (text: string, embed, channel: string, type: string) => {
  const school = new School()

  const data = load(`data/${type}.json`)[channel]
  if (!data) {
    return embed.setDescription(messages.unregistered)
  } else {
    school.init(School.Type[data.type], School.Region[data.region], data.schoolCode)
    const calendar = await school.getCalendar({ default: null })
    embed.setTitle(`${calendar.year}년 ${calendar.month}월\n`)

    calendar.year = undefined
    calendar.month = undefined
    calendar.day = undefined
    calendar.today = undefined

    for (const day in calendar) {
      if (calendar[day]) {
        embed.addField(day + '일', calendar[day].replace(/,/g, '\n'))
      }
    }
  }
}

export default schedule
