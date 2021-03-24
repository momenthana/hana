import { load, save } from "../utils"

const messages = load("src/messages.json")

export class Remove {
  name: string
  description: string
  msg: any
  embed: any
  constructor({ msg, embed }) {
    this.name = "Remove"
    this.description = ""
    this.msg = msg
    this.embed = embed
  }

  async discord() {
    const msg = this.msg
    const embed = this.embed

    const data = load("data/school.json")
    if (!data[msg.channel.id]) {
      embed.setDescription(messages.unregistered)
      msg.channel.send(embed)
    }

    delete data[msg.channel.id]
    save(`data/school.json`, data)
    embed.setDescription(`채널에 등록된 정보를 삭제했어!`)
    msg.channel.send(embed)
  }
}
