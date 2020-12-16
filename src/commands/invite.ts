const invite = async ({msg, embed}) => {
  embed.setTitle('다른 서버에 추가하기!')
    .setDescription('https://discord.com/oauth2/authorize?client_id=711769311387058238&scope=bot&permissions=0')
  msg.channel.send(embed)
}

export default invite
