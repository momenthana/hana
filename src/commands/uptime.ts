const uptime = async (text, embed) => {
  if (text.match(/uptime/i)) {
    embed.setTitle('Uptime!')
      .setDescription(Math.floor(process.uptime()) + '초')
  }
}

export default uptime
