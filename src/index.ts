import Discord from 'discord.js'
import colors from 'colors'
import fs from 'fs'
import { help, invite, meal, ping, remove, schedule, search, uptime } from './commands'
import { embed } from './utils'

const commands = {
  'help|도움|도와줘|명령': help,
  'invite|초대링크|초대주소': invite,
  'meal|아침|조식|점심|중식|저녁|석식|급식|식단|학식': meal,
  'ping|핑': ping,
  'remove|삭제|제거': remove,
  'schedule|일정': schedule,
  'search|검색': search,
  'uptime|업타임': uptime,
}

const messages = JSON.parse(fs.readFileSync('src/messages.json').toString())

if (process.env.discordToken) {
  const discord = new Discord.Client()

  discord.on('ready', () => {
    console.log(colors.green(`Logged in as ${discord.user.tag}!`))
  })

  discord.on('message', async msg => {
    try {
      if (msg.author.bot) return

      if (msg.system) {
        if (msg.type == 'GUILD_MEMBER_JOIN') msg.react('👋')
        else if (msg.type == 'PINS_ADD') msg.react('📌')
        return
      }

      if (!(msg.content.includes(discord.user.username)) != (msg.mentions.users.first() ? discord.user.id == msg.mentions.users.first().id : false)) return

      for (const [regexp, command] of Object.entries(commands)) {
        if (msg.content.match(RegExp(regexp, 'i'))) {
          await command({msg, discord, embed: embed(msg)})
        }
      }
    } catch (error) {
      console.warn(error)
    }
  })

  setInterval(() => {
    discord.user.setActivity(eval(messages.activity[Math.floor(Math.random() * messages.activity.length)]), {
      type: process.env.twitch ? 'STREAMING' : null,
      url: 'https://www.twitch.tv/' + process.env.twitch
    })
  }, 10000)

  discord.login(process.env.discordToken)
}
