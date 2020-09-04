import School from 'school-kr'
import { dateConvert, load } from '../utils'

const messages = load('src/messages.json')
const define = load('src/define.json')

const mealConvert = async (date: Date, type: string, embed, school) => {
  let meal = await school.getMeal({ year: date.getFullYear(), month: date.getMonth() + 1 })

  let rebase = meal[date.getDate()].replace(/[0-9*.]|amp;|\//gi, '')

  if (rebase.includes(`[${type}]`)) {
    const length = rebase.indexOf(`[${type}]`)
    const sub = rebase.substring(length, rebase.indexOf('[', length + 1) !== -1 ? rebase.indexOf('[', length + 1) : rebase.length)
    embed.addField(type, sub.replace(/\[\S*?\]/g, ''), false)
  } else if (type === '급식') {
    ['조식', '중식', '석식'].forEach(e => {
      const length = rebase.indexOf(`[${e}]`)
      const sub = rebase.substring(length, rebase.indexOf('[', length + 1) !== -1 ? rebase.indexOf('[', length + 1) : rebase.length)
      if (sub) {
        embed.addField(e, sub.replace(/\[\S*?\]/g, ''), true)
      }
    })
  }

  if (!embed.fields.length) {
    embed.setDescription(type + '이 없습니다')
  }

  return embed
}

const meal = async (text, embed, channel, type) => {
  const school = new School()

  const data = load(`data/${type}.json`)[channel]
  if (!data) {
    return embed.setDescription(messages.unregistered)
  } else {
    const date = dateConvert(text)
    school.init(School.Type[data.type], School.Region[data.region], data.schoolCode)
    embed.setTitle(`${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${define.week[date.getDay()]})\n`)
    return await mealConvert(date, text.match(/(아침|조식)/) ? '조식' : text.match(/(점심|중식)/) ? '중식' : text.match(/(저녁|석식)/) ? '석식' : '급식', embed, school)
  }
}

export default meal
