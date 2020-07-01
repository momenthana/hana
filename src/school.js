const School = require('school-kr')
const school = new School()
const fs = require('fs')

const dateConvert = require('./dateConvert.js')
const define = JSON.parse(fs.readFileSync('src/define.json').toString())
const messages = JSON.parse(fs.readFileSync('src/messages.json').toString())
const search = {}

const load = (type) => {
  try {
    return JSON.parse(fs.readFileSync(`src/data/${type}.json`).toString())
  } catch {
    return {}
  }
}

const save = (type, info) => {
  try {
    fs.writeFileSync(`src/data/${type}.json`, JSON.stringify(info))
  } catch {
    fs.mkdirSync('src/data')
    fs.writeFileSync(`src/data/${type}.json`, JSON.stringify(info))
  }
}

const meal = async (date, type, info) => {
  let meal = await school.getMeal({ year: date.getFullYear(), month: date.getMonth() + 1 })
  meal = meal[date.getDate()].replace(/[0-9*.]|amp;|\//gi, '')
  let fields = []

  if (meal.includes(`[${type}]`)) {
    const length = meal.indexOf(`[${type}]`)
    meal = meal.substring(length, meal.indexOf('[', length + 1) !== -1 ? meal.indexOf('[', length + 1) : meal.length)
    fields.push({ name: type, value: meal.replace(/\[\S*?\]/g, '') })
  } else if (type === '급식') {
    ['조식', '중식', '석식'].forEach(e => {
      const length = meal.indexOf(`[${e}]`)
      let content = meal.substring(length, meal.indexOf('[', length + 1) !== -1 ? meal.indexOf('[', length + 1) : meal.length)
      if (content) {
        fields.push({ name: e, value: content.replace(/\[\S*?\]/g, ''), inline: true })
      }
    })
  }

  if (!fields.length) {
    info.content = type + '이 없습니다'
  }

  return fields
}

const index = async (text, channel, type) => {
  let info = { title: '', content: '', fields: [] }
  if (text.includes('하나')) {
    if (text.match(/검색/)) {
      const result = []
      if (text.match(/.*(초|중|고|학교|유치원)/)) {
        for (const key in School.Region) {
          const splitText = text.match(/.*(초|중|고|학교|유치원)/)[0].split(' ')
          const search = await school.search(School.Region[key], splitText[splitText.length - 1])
          search.forEach(e => {
            let addr
            for (const name in define.region) {
              if (key === name) {
                addr = define.region[name]
              }
            }
            let type = 'HIGH'
            const schoolExp = { 중학교: 'MIDDLE', 초등학교: 'ELEMENTARY', 유치원: 'KINDERGARTEN' }
            for (const name in schoolExp) {
              if (e.name.match(name)) {
                type = schoolExp[name]
              }
            }
            result.push({ name: e.name, type: type, schoolCode: e.schoolCode, region: key, schoolRegion: addr, address: e.address })
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

module.exports = index
