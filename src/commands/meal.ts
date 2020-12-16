const school = require('school-info')
import { dateConvert, load } from '../utils'

const messages = load('src/messages.json')
const define = load('src/define.json')

const meal = async ({ msg, embed }) => {
  const data = load('data/school.json')[msg.channel.id]

  if (!data) {
    embed.setDescription(messages.unregistered)
    msg.channel.send(embed)
    return
  }

  const text = msg.content.replace(/<@!?(\d+)>/g, '')
  const date = dateConvert(text)
  const getDay = date.getDay()
  const getDate = date.getDate()
  const getMonth = date.getMonth() + 1
  const getFullYear = date.getFullYear()
  const M = getMonth > 10 ? getMonth : '0' + getMonth
  const D = getDate > 10 ? getDate : '0' + getDate

  school.meal(Object.assign({
    MLSV_YMD: String(getFullYear) + M + D
  }, data))
    .then(res => {
      embed.setTitle(`${getFullYear}년 ${getMonth}월 ${getDate}일 ${define.week[getDay]}요일`)

      const type = text.match(/아침|조식/) ? '조식' : text.match(/점심|중식/) ? '중식' : text.match(/저녁|석식/) ? '석식' : null

      res.forEach(e => {
        if (!type)
          embed.addField(e.MMEAL_SC_NM, e.DDISH_NM.replace(/\<br\/\>/gi, '\n').replace(/\*|[\d.]/gi, ''))
        else if (e.MMEAL_SC_NM == type) {
          embed.addField(e.MMEAL_SC_NM, e.DDISH_NM.replace(/\<br\/\>/gi, '\n').replace(/\*|[\d.]/gi, ''))
          embed.addField(e.CAL_INFO, e.NTR_INFO.replace(/\<br\/\>/gi, '\n'))
        }
      })

      if (!embed.fields.length) embed.setDescription(`${type ? type + ' ' : ''}정보가 없습니다.`)

      msg.channel.send(embed)
    })
}

export default meal
