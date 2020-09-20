import { load, save } from '../utils'

const messages = load('src/messages.json')

const remove = async (text: string, embed, channel: string, type: string) => {
  const data = load(`data/${type}.json`)
  if (!data[channel]) {
    embed.setDescription(messages.unregistered)
    return
  }

  delete data[channel]
  save(`data/${type}.json`, data)
  embed.setDescription(`채널에 등록된 정보를 삭제했어!`)
}

export default remove
