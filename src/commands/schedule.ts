const school = require('school-info')
import { dateConvert, load } from '../utils'

const messages = load('src/messages.json')

const schedule = async ({msg, embed}) => {
  const data = load('data/school.json')[msg.channel.id]

  if (!data) {
    embed.setDescription(messages.unregistered)
    msg.channel.send(embed)
    return
  }

  const text = msg.content.replace(/<@!?(\d+)>/g, '')
  const date = dateConvert(text)
  const getMonth = date.getMonth() + 1
  const getFullYear = date.getFullYear()
  const M = getMonth + 1 > 10 ? getMonth : '0' + getMonth

  date.setMonth(getMonth)
  date.setDate(0)

  school.schedule(Object.assign({
    KEY: process.env.neisToken,
    AA_FROM_YMD: String(getFullYear) + M + '01',
    AA_TO_YMD: String(getFullYear) + M + date.getDate(),
  }, data))
    .then(res => {
      embed.setTitle(`${getFullYear}년 ${getMonth}월 학사일정`)
      let prependDate = null
      res.forEach(e => {
        const currentDate = Number(e.AA_YMD) % 100
        if (currentDate == prependDate) {
          embed.fields[embed.fields.length - 1].value += `\n${e.EVENT_NM}`
        } else {
          embed.addField(`${currentDate}일 ${e.SBTR_DD_SC_NM}`, e.EVENT_NM)
          prependDate = currentDate
        }
      })
      msg.channel.send(embed)
    })
    .catch(() => {
      embed.setDescription('일정 정보가 없습니다.')

      msg.channel.send(embed)
    })
}

export default schedule
