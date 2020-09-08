const uptime = (text, embed) => {
  let uptime = process.uptime()
  let sec = Math.floor(uptime % 60)
  let min = Math.floor(uptime / 60 % 60)
  let hour = Math.floor(uptime / 60 / 60 % 24)
  let day = Math.floor(uptime / 60 / 60 / 24)

  embed.setTitle('Uptime!')
    .setDescription(`${day ? day + '일' : ''} ${hour ? hour + '시간' : ''} ${min ? min + '분' : ''} ${sec}초`)
}

export default uptime
