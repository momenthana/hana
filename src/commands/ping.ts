const ping = async (msg, embed, discord) => {
  if (msg.content.match(/하나.*(핑|ping)|(핑|ping).*하나/)) {
    embed.setTitle(msg.content.includes('핑') ? '퐁!' : 'Pong!')
      .addField('Discord Server', '측정중...')
      .addField('지연 시간', '측정중...')
    let pingMsg = await msg.channel.send(embed)
    embed.fields = []
    embed.addField('Discord Server', Math.round(discord.ws.ping) + 'ms')
      .addField('지연 시간', pingMsg.createdTimestamp - msg.createdTimestamp + 'ms')
    pingMsg.edit(embed)
  }
}

export default ping
