import School from 'school-kr'
import fs from 'fs'
import { search, set } from './commands'
import { dateConvert, embed } from './utils'

const school = new School()
const define = JSON.parse(fs.readFileSync('src/define.json').toString())
const messages = JSON.parse(fs.readFileSync('src/messages.json').toString())
const searches = {}

const load = (type: string) => {
  try {
    return JSON.parse(fs.readFileSync(`data/${type}.json`).toString())
  } catch {
    return {}
  }
}

const save = (type: string, data: object) => {
  try {
    fs.writeFileSync(`data/${type}.json`, JSON.stringify(data))
  } catch {
    fs.mkdirSync('data')
    fs.writeFileSync(`data/${type}.json`, JSON.stringify(data))
  }
}

const meal = async (date: Date, type: string, Embed) => {
  let meal = await school.getMeal({ year: date.getFullYear(), month: date.getMonth() + 1 })
  let rebase = meal[date.getDate()].replace(/[0-9*.]|amp;|\//gi, '')

  if (rebase.includes(`[${type}]`)) {
    const length = rebase.indexOf(`[${type}]`)
    const sub = rebase.substring(length, rebase.indexOf('[', length + 1) !== -1 ? rebase.indexOf('[', length + 1) : rebase.length)
    Embed.addField(type, sub.replace(/\[\S*?\]/g, ''), false)
  } else if (type === '급식') {
    ['조식', '중식', '석식'].forEach(e => {
      const length = rebase.indexOf(`[${e}]`)
      const sub = rebase.substring(length, rebase.indexOf('[', length + 1) !== -1 ? rebase.indexOf('[', length + 1) : rebase.length)
      if (sub) {
        Embed.addField(e, sub.replace(/\[\S*?\]/g, ''), true)
      }
    })
  }

  if (!Embed.fields.length) {
    Embed.setDescription(type + '이 없습니다')
  }

  return Embed
}

const index = async (type: string, channel: string, text: string, msg: object) => {
  const Embed = embed(msg)
  if (text.includes('하나')) {
    await search(text, Embed, searches, school, define, channel)
    set(text, Embed, searches, messages, channel, type, load, save)

    if (text.match(/(하나!|도움|도와)/)) {
      return Embed.setDescription(messages.help)
    }

    if (text.match(/(아침|조식|점심|중식|저녁|석식|급식)/)) {
      const data = load(type)[channel]
      if (!data) {
        return Embed.setDescription(messages.unregistered)
      } else {
        const date = dateConvert(text)
        school.init(School.Type[data.type], School.Region[data.region], data.schoolCode)
        Embed.setTitle(`${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${define.week[date.getDay()]})\n`)
        return await meal(date, text.match(/(아침|조식)/) ? '조식' : text.match(/(점심|중식)/) ? '중식' : text.match(/(저녁|석식)/) ? '석식' : '급식', Embed)
      }
    }

    if (text.includes('일정')) {
      const data = load(type)[channel]
      if (!data) {
        return Embed.setDescription(messages.unregistered)
      } else {
        school.init(School.Type[data.type], School.Region[data.region], data.schoolCode)
        const calendar = await school.getCalendar({ default: null })
        Embed.setTitle(`${calendar.year}년 ${calendar.month}월\n`)

        calendar.year = undefined
        calendar.month = undefined
        calendar.day = undefined
        calendar.today = undefined

        for (const day in calendar) {
          if (calendar[day]) {
            Embed.addField(day + '일', calendar[day].replace(/,/g, '\n'))
          }
        }
      }
    }
  }

  return Embed
}

export default index
