export class Invite {
  name: string
  description: string
  msg: any
  embed: any
  constructor({ msg, embed }: any) {
    this.name = "Ping"
    this.description = ""
    this.msg = msg
    this.embed = embed
  }

  async discord() {
    const msg = this.msg
    const embed = this.embed

    embed
      .setTitle("다른 서버에 추가하기!")
      .setDescription(
        "https://discord.com/oauth2/authorize?client_id=711769311387058238&scope=bot&permissions=0"
      )
    msg.channel.send(embed)
  }
}
