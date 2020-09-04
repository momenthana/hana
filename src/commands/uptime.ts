const uptime = async (text, embed) => {
  embed.setTitle('Uptime!')
    .setDescription(Math.floor(process.uptime()) + '초')
}

export default uptime
