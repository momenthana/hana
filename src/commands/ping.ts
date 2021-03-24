export class Ping {
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
      .setTitle(msg.content.includes("핑") ? "퐁!" : "Pong!")
      .addField("Discord Server", "측정중...")
      .addField("지연 시간", "측정중...")
    let pingMsg = await msg.channel.send(embed)
    embed.fields = []
    embed
      .addField("Discord Server", Math.round(discord.ws.ping) + "ms")
      .addField(
        "지연 시간",
        pingMsg.createdTimestamp - msg.createdTimestamp + "ms"
      )
    pingMsg.edit(embed)
  }
}
