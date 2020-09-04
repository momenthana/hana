import { load, save } from '../utils'

const messages = load('src/messages.json')

const set = async (text: string, embed, channel: string, type: string, school, searches) => {
  const searchData = searches[channel]
  if (!searchData) {
    embed.setDescription(messages.unregistered)
  } else {
    const data = load(`data/${type}.json`)
    const i = searchData[Number(text.replace(/[^{0-9}]/gi, '')) - 1]
    embed.setDescription(`${i.name}${i.type === 'KINDERGARTEN' ? '을' : '를'} 채널에 등록했어!`)
    data[channel] = { type: i.type, region: i.region, schoolCode: i.schoolCode }
    save(`data/${type}.json`, data)
  }
}

export default set
