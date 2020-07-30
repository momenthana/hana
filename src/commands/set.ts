const set = async (text, Embed, searches, messages, channel, type, load, save) => {
  if (text.match(/등록/)) {
    const searchData = searches[channel]
    if (!searchData) {
      Embed.setDescription(messages.unregistered)
    } else {
      const data = load(`data/${type}.json`)
      const i = searchData[Number(text.replace(/[^{0-9}]/gi, '')) - 1]
      Embed.setDescription(`${i.name}${i.type === 'KINDERGARTEN' ? '을' : '를'} 채널에 등록했어!`)
      data[channel] = { type: i.type, region: i.region, schoolCode: i.schoolCode }
      save(`data/${type}.json`, data)
    }
  }
}

export default set
