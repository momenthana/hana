const school = require('school-info')
import { load, save, embed } from '../utils'

const search = async ({ msg }) => {
  const embedA = embed(msg), embedB = embed(msg)

  const text = msg.content.replace(/<@!?(\d+)>/g, '')
  
  if (!text.match(/.*(초|중|고|학교|유치원)/)) {
    embedA.setDescription('학교나 유치원 이름을 정확하게 입력해줘!')
    msg.channel.send(embedA)
    return
  }

  const name = text.match(/.*(초|중|고|학교|유치원)/)[0].split(' ')

  school.search({
    SCHUL_NM: name[name.length - 1]
  }).then(async res => {
    res.forEach((e, i) => {
      embedA.addField(`${i + 1}. ${e.SCHUL_NM}`, e.ORG_RDNMA)
    });
    const reply = await msg.channel.send(embedA)

    const emoji = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣']

    emoji.forEach((e, i) => {
      if (i < res.length) reply.react(e)
    });

    const filter = (reaction, user) => {
      return emoji.includes(reaction.emoji.name) && user.id === msg.author.id;
    };

    reply.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
      .then(collected => {
        const reaction = collected.first();

        emoji.forEach((e, i) => {
          if (reaction.emoji.name === e) {
            embedB.setDescription(`${res[i].SCHUL_NM} 등록했어!`)
            const data = load('data/school.json')
            data[msg.channel.id] = {
              ATPT_OFCDC_SC_CODE: res[i].ATPT_OFCDC_SC_CODE,
              SD_SCHUL_CODE: res[i].SD_SCHUL_CODE
            }
            save('data/school.json', data)
            reply.channel.send(embedB)
          }
        })
      })
      .catch(collected => {
        embedB.setDescription('등록이 취소됬어!')
        reply.channel.send(embedB);
      });
  })
}

export default search
