const school = require("school-info")
import base62 from "base62"
import { dateConvert, load } from "../utils"

const messages = load("src/messages.json")
const define = load("src/define.json")

export class Meal {
  name: string
  description: string
  msg: any
  client: any
  embed: any
  constructor({ msg, discord, embed }) {
    this.name = "Ping"
    this.description = ""
    this.msg = msg
    this.client = discord
    this.embed = embed
  }

  async discord() {
    const msg = this.msg
    const discord = this.client
    const embed = this.embed

    const data = load("data/school.json")[msg.channel.id]

    if (!data) {
      embed.setDescription(messages.unregistered)
      msg.channel.send(embed)
      return
    }

    const text = msg.content.replace(/<@!?(\d+)>/g, "")
    const date = dateConvert(text)
    const getDay = date.getDay()
    const getDate = date.getDate()
    const getMonth = date.getMonth() + 1
    const getFullYear = date.getFullYear()
    const M = getMonth > 9 ? getMonth : "0" + getMonth
    const D = getDate > 9 ? getDate : "0" + getDate

    embed.setTitle(
      `${getFullYear}년 ${getMonth}월 ${getDate}일 ${define.week[getDay]}요일`
    )
    embed.setAuthor(
      "Web 바로가기",
      "https://user-images.githubusercontent.com/59823089/110070696-dcb3e480-7dbd-11eb-9ee3-7d6f040f3e25.png",
      `https://school.hana.icu/${
        data.ATPT_OFCDC_SC_CODE[0] + base62.encode(data.SD_SCHUL_CODE)
      }/meal`
    )

    const type = text.match(/아침|조식/)
      ? "조식"
      : text.match(/점심|중식/)
      ? "중식"
      : text.match(/저녁|석식/)
      ? "석식"
      : null

    school
      .meal(
        Object.assign(
          {
            MLSV_YMD: String(getFullYear) + M + D,
          },
          data
        )
      )
      .then((res) => {
        if (!res[0]) {
          embed.setDescription(`${type ? type + " " : ""}정보가 없어!`)
          msg.channel.send(embed)
          return
        }

        res.forEach((e) => {
          if (!type)
            embed.addField(
              e.MMEAL_SC_NM,
              e.DDISH_NM.replace(/\<br\/\>/gi, "\n").replace(/\*|[\d.]/gi, ""),
              true
            )
          else if (e.MMEAL_SC_NM == type) {
            embed.addField(
              e.MMEAL_SC_NM,
              e.DDISH_NM.replace(/\<br\/\>/gi, "\n").replace(/\*|[\d.]/gi, "")
            )
            embed.addField(e.CAL_INFO, e.NTR_INFO.replace(/\<br\/\>/gi, "\n"))
          }
        })

        if (!embed.fields.length)
          embed.setDescription(`${type ? type + " " : ""}정보가 없어!`)
        msg.channel.send(embed)
      })
      .catch((err) => {
        embed.setTitle("Error")
        embed.setDescription(err)
        embed.addField(
          "에러가 지속되면 개발자 DM으로 알려줘!",
          "https://instagram.com/moment._.hana/"
        )
        msg.channel.send(embed)
      })
  }
}
