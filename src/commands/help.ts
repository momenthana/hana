export class Help {
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

    embed
      .setTitle("도움말")
      .addField(
        `@${discord.user.username} 급식, 내일 급식, 월요일 급식, 3일 뒤 급식`,
        "급식 정보는 다양하게 확인할 수 있어"
      )
      .addField(`@${discord.user.username} 일정`, "일정 정보를 확인할 수 있어")
      .addField(
        `@${discord.user.username} [학교명] 검색`,
        "채널에 학교를 등록할 수 있어"
      )
      .addField(
        `@${discord.user.username} 삭제`,
        "채널에 등록된 학교를 삭제할 수 있어"
      )
    msg.channel.send(embed)
  }
}
