const set = async (text, info, searches, messages, channel, type, load, save) => {
  if (text.match(/등록/)) {
    const searchData = searches[channel]
    if (!searchData) {
      info.content = messages.unregistered
    } else {
      const data = load(type)
      const i = searchData[Number(text.replace(/[^{0-9}]/gi, '')) - 1]
      info.content = `${i.name}${i.type === 'KINDERGARTEN' ? '을' : '를'} 채널에 등록했어!`
      data[channel] = { type: i.type, region: i.region, schoolCode: i.schoolCode }
      save(type, data)
    }
  }
}

export default set
