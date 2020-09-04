import { help, meal, schedule, search, set, uptime } from './commands'

const searches = {}

const commands = {
  'help|도움|도와줘|help': help,
  'meal|아침|조식|점심|중식|저녁|석식|급식': meal,
  'schedule|일정': schedule,
  'search|검색': search,
  'set|등록': set,
  'uptime|업타임': uptime,
}

const index = async (type: string, channel: string, text: string, embed) => {
  if (text.includes('하나')) {
    for (const [regexp, command] of Object.entries(commands)) {
      if (text.match(RegExp(regexp, 'i'))) {
        await command(text, embed, channel, type, searches)
        return embed
      }
    }
  }
}

export default index
