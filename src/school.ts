import School from 'school-kr'
import fs from 'fs'
import { search, set } from './commands'
import { dateConvert } from './utils'

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

const save = (type: string, info: object) => {
  try {
    fs.writeFileSync(`data/${type}.json`, JSON.stringify(info))
  } catch {
    fs.mkdirSync('data')
    fs.writeFileSync(`data/${type}.json`, JSON.stringify(info))
  }
}

const meal = async (date: Date, type: string, info) => {
  let meal = await school.getMeal({ year: date.getFullYear(), month: date.getMonth() + 1 })
  let rebase = meal[date.getDate()].replace(/[0-9*.]|amp;|\//gi, '')
  let fields = []

  if (rebase.includes(`[${type}]`)) {
    const length = rebase.indexOf(`[${type}]`)
    const sub = rebase.substring(length, rebase.indexOf('[', length + 1) !== -1 ? rebase.indexOf('[', length + 1) : rebase.length)
    fields.push({ name: type, value: sub.replace(/\[\S*?\]/g, ''), inline: false })
  } else if (type === '급식') {
    ['조식', '중식', '석식'].forEach(e => {
      const length = rebase.indexOf(`[${e}]`)
      const sub = rebase.substring(length, rebase.indexOf('[', length + 1) !== -1 ? rebase.indexOf('[', length + 1) : rebase.length)
      if (sub) {
        fields.push({ name: e, value: sub.replace(/\[\S*?\]/g, ''), inline: true })
      }
    })
  }

  if (!fields.length) {
    info.content = type + '이 없습니다'
  }

  return fields
}

const index = async (text: string, channel: string, type: string) => {
  let info = { title: '', content: '', fields: [] }
  if (text.includes('하나')) {
    await search(text, info, searches, school, define, channel)
    set(text, info, searches, messages, channel, type, load, save)

    if (text.match(/(하나!|도움|도와)/)) {
      info.content = messages.help
      type === 'discord' ? info.content += '\n다른건 <@457459470424080384> 또는 momenthana@kakao.com으로 질문해줘!' : '\n다른건 momenthana@kakao.com으로 질문해줘!'
    }

    if (text.match(/(아침|조식|점심|중식|저녁|석식|급식)/)) {
      const data = load(type)[channel]
      if (!data) {
        info.content = messages.unregistered
      } else {
        const date = dateConvert(text)
        school.init(School.Type[data.type], School.Region[data.region], data.schoolCode)
        info.title = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${define.week[date.getDay()]})\n`
        info.fields = await meal(date, text.match(/(아침|조식)/) ? '조식' : text.match(/(점심|중식)/) ? '중식' : text.match(/(저녁|석식)/) ? '석식' : '급식', info)
      }
    }

    if (text.includes('일정')) {
      const data = load(type)[channel]
      if (!data) {
        info.content = messages.unregistered
      } else {
        school.init(School.Type[data.type], School.Region[data.region], data.schoolCode)
        const calendar = await school.getCalendar({ default: null })
        info.title = `${calendar.year}년 ${calendar.month}월\n`

        calendar.year = undefined
        calendar.month = undefined
        calendar.day = undefined
        calendar.today = undefined

        for (const day in calendar) {
          if (calendar[day]) {
            info.fields.push({ name: day + '일', value: calendar[day].replace(/,/g, '\n') })
          }
        }
      }
    }
  }

  return info
}

export default index
