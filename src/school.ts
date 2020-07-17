import schoolKr from 'school-kr'
const school = new schoolKr()
import fs from 'fs'

import dateConvert from './dateConvert'
const define = JSON.parse(fs.readFileSync('src/define.json').toString())
const messages = JSON.parse(fs.readFileSync('src/messages.json').toString())
const search = {}

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
    fields.push({ name: type, value: sub.replace(/\[\S*?\]/g, '') })
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
    if (text.match(/검색/)) {
      let result: Array<any> = []
      if (text.match(/.*(초|중|고|학교|유치원)/)) {
        for (const region in schoolKr.Region) {
          const splitText = text.match(/.*(초|중|고|학교|유치원)/)[0].split(' ')
          const search = await school.search(schoolKr.Region[region], splitText[splitText.length - 1])
          search.forEach(e => {
            let addr: any, type: any = 'HIGH'
            for (const [key, value] of Object.entries(define.region)) {
              if (region === key) addr = value
            }
            for (const [key, value] of Object.entries(define.schoolExp)) {
              if (e.name.match(key)) type = value
            }
            result.push({ name: e.name, type: type, schoolCode: e.schoolCode, region: region, schoolRegion: addr, address: e.address })
          })
        }
        for (const key in result) {
          info.content += `\n${Number(key) + 1}. ${result[key].name} (${result[key].address !== ' ' ? result[key].address : result[key].schoolRegion ? result[key].schoolRegion + '교육청 소재' : '소재지 정보 없음'})`
          search[channel] = result
        }
        info.content += '\n\'하나야 1번 등록해줘\'처럼 말해주면 채널에 등록해줄게'
      } else {
        info.content = '학교나 유치원 이름을 정확하게 입력해줘!'
      }
    }

    if (text.match(/등록/)) {
      const searchData = search[channel]
      if (!searchData) {
        info.content = messages.unregistered
      } else {
        const data = load(type)
        const i = searchData[Number(text.replace(/[^{0-9}]/gi, '')) - 1]
        info.content = `${i.name}${i.type === 'KINDERGARTEN' ? '을' : '를'} 채널에 등록했어!`
        data[channel] = { type: i.type, region: i.region, schoolCode: i.schoolCode }
        save(type, data)
      }
    }

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
        school.init(schoolKr.Type[data.type], schoolKr.Region[data.region], data.schoolCode)
        info.title = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${define.week[date.getDay()]})\n`
        info.fields = await meal(date, text.match(/(아침|조식)/) ? '조식' : text.match(/(점심|중식)/) ? '중식' : text.match(/(저녁|석식)/) ? '석식' : '급식', info)
      }
    }

    if (text.includes('일정')) {
      const data = load(type)[channel]
      if (!data) {
        info.content = messages.unregistered
      } else {
        school.init(schoolKr.Type[data.type], schoolKr.Region[data.region], data.schoolCode)
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
