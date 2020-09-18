
import School from 'school-kr'
import { help, invite, meal, schedule, search, set, uptime } from './commands'

const school = new School()
const searches = {}

const commands = {
  'help|도움|도와줘': help,
  'invite|초대링크|초대주소': invite,
  'meal|아침|조식|점심|중식|저녁|석식|급식': meal,
  'schedule|일정': schedule,
  'search|검색': search,
  'set|등록': set,
  'uptime|업타임': uptime,
}

const index = async (type: string, channel: string, text: string, embed) => {
  for (const [regexp, command] of Object.entries(commands)) {
    if (text.match(RegExp(regexp, 'i'))) {
      await command(text, embed, channel, type, school, searches)
      return embed
    }
  }
}

export default index
