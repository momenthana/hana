import { RTMClient } from '@slack/rtm-api'
import Discord from 'discord.js'
import colors from 'colors'
import fs from 'fs'

import school from './school'
const messages = JSON.parse(fs.readFileSync('src/messages.json').toString())

if (process.env.discordToken) {
  const discord = new Discord.Client()

  discord.on('ready', () => {
    console.log(colors.green(`Logged in as ${discord.user.tag}!`))
  })

  discord.on('message', async msg => {
    try {
      if (msg.author.bot) return

      const embed = new Discord.MessageEmbed()
        .setColor('#f7cac9')
        .setTimestamp()
        .setFooter(msg.author.username, msg.author.avatarURL());

      if (msg.content.match(/하나.*(핑|ping)|(핑|ping).*하나/)) {
        embed.setTitle(msg.content.includes('핑') ? '퐁!' : 'Pong!')
          .fields = [
            { name: 'Discord Server', value: '측정중...', inline: false },
            { name: '지연 시간', value: '측정중...', inline: false }
          ]
        let ping = await msg.channel.send({ embed })
        embed.fields = [
          { name: 'Discord Server', value: Math.round(discord.ws.ping) + 'ms', inline: false },
          { name: '지연 시간', value: ping.createdTimestamp - msg.createdTimestamp + 'ms', inline: false }
        ]
        ping.edit({ embed })
      } else {
        let info = await school(msg.content, msg.channel.id, 'discord')
        if (info.content || info.fields.length) {
          embed.setTitle(info.title).setDescription(info.content)
            .fields = info.fields
          await msg.channel.send({ embed })
          info.fields.forEach(e => {
            info.content += `${e.name} ${e.value}\n`
          })
          console.log(colors.green(`Discord ${msg.channel.id}\n${msg.content}\n`), info.title, info.content)
        }
      }
    } catch (error) {
      console.warn(colors.red(`Discord ${msg.channel.id}\n${msg.content}\n`), error)
    }
  })

  const length = messages.activity.length

  setInterval(() => {
    messages.activity[length] = '서버 ' + discord.guilds.cache.size + '개에서 사용'
    discord.user.setActivity(messages.activity[Math.floor(Math.random() * messages.activity.length)], {
      type: process.env.twitch ? 'STREAMING' : null,
      url: 'https://www.twitch.tv/' + process.env.twitch
    })
  }, 10000)

  discord.login(process.env.discordToken)
}

if (process.env.slackToken) {
  const slack = new RTMClient(process.env.slackToken)

  slack.on('member_joined_channel', async event => {
    try {
      const random = Math.floor(Math.random() * messages.joined.length)
      const info = messages.joined[random].replace('${event.user}', event.user)
      slack.sendMessage(info, event.channel)
      console.log(colors.green(`Slack ${event.channel}\n`), info)
    } catch (error) {
      console.warn(colors.red(`Slack ${event.channel}\n`), error)
    }
  })

  slack.on('message', async event => {
    try {
      const info = await school(event.text, event.channel, 'slack')

      info.fields.forEach(e => {
        info.content += `${e.name} ${e.value}\n`
      })
      
      if (info.content) {
        await slack.sendMessage(info.title + info.content, event.channel)
        console.log(colors.green(`Slack ${event.channel}\n${event.text}\n`), info.title, info.content)
      }
    } catch (error) {
      console.warn(colors.red(`Slack ${event.channel}\n${event.text}\n`), error)
    }
  });

  (async () => {
    await slack.start()
    console.log(colors.green('Slackbot is running!'))
  })()
}
