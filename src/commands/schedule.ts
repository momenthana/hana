const school = require("school-info")
import { dateConvert, load } from "../utils"

const messages = load("src/messages.json")

export class Schedule {
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
    const getMonth = date.getMonth() + 1
    const getFullYear = date.getFullYear()
    const M = getMonth > 9 ? getMonth : "0" + getMonth

    date.setMonth(getMonth)
    date.setDate(0)

    school
      .schedule(
        Object.assign(
          {
            KEY: process.env.neisToken,
            AA_FROM_YMD: String(getFullYear) + M + "01",
            AA_TO_YMD: String(getFullYear) + M + date.getDate(),
          },
          data
        )
      )
      .then((res) => {
        if (!res[0]) {
          embed.setDescription("일정 정보가 없어!")
          return msg.channel.send(embed)
        }

        embed.setTitle(`${getFullYear}년 ${getMonth}월 학사일정`)
        let prependDate = null
        res.forEach((e) => {
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
      .catch((err) => {
        embed.setTitle("Error")
        embed.setDescription(err)
        embed.addField(
          "에러가 지속되면 아래 디스코드 서버에서 알려줘!",
          "https://discord.gg/RxRSgav"
        )
        msg.channel.send(embed)
      })
  }
}
