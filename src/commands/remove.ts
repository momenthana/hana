import { load, save } from '../utils'

const messages = load('src/messages.json')

const remove = async ({msg, embed}) => {
  const data = load('data/school.json')
  if (!data[msg.channel.id]) {
    embed.setDescription(messages.unregistered)
    msg.channel.send(embed)
  }

  delete data[msg.channel.id]
  save(`data/school.json`, data)
  embed.setDescription(`채널에 등록된 정보를 삭제했어!`)
  msg.channel.send(embed)
}

export default remove
