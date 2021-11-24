export class Remove {
  name: string
  description: string
  msg: any
  embed: any
  constructor({ msg, embed }: any) {
    this.name = "Remove"
    this.description = ""
    this.msg = msg
    this.embed = embed
  }

  async discord() {
    const msg = this.msg
    const embed = this.embed

    const data = {}
    if (!data[msg.channel.id]) {
      embed.setDescription("messages.unregistered")
      msg.channel.send(embed)
    }

    delete data[msg.channel.id]

    embed.setDescription(`채널에 등록된 정보를 삭제했어!`)
    msg.channel.send(embed)
  }
}
