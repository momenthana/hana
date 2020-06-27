const { RTMClient } = require('@slack/rtm-api')
const Discord = require('discord.js')
const colors = require('colors')
const fs = require('fs')

const school = require('./school')
const messages = JSON.parse(fs.readFileSync('src/messages.json').toString())

if (process.env.discordToken) {
  const discord = new Discord.Client()
  const embed = new Discord.RichEmbed().setColor('#f7cac9')

  discord.on('ready', () => {
    console.log(`Logged in as ${discord.user.tag}!`.green)
  })

  discord.on('message', async msg => {
    try {
      if (msg.content.match(/하나.*(핑|ping)|(핑|ping).*하나/)) {
        embed.setTitle(msg.content.includes('핑') ? '퐁!' : 'Pong!')
        .fields = [
          { name: 'Discord Server', value: '측정중...' },
          { name: '지연 시간', value: '측정중...' }
        ]
        let ping = await msg.channel.send({ embed })
        embed.fields = [
          { name: 'Discord Server', value: Math.round(discord.ping) + 'ms' },
          { name: '지연 시간', value: ping.createdTimestamp - msg.createdTimestamp + 'ms' }
        ]
        ping.edit({ embed })
        embed.fields = null
      }
      
      let info = await school(msg.content, msg.channel.id, 'discord', { type: '' })
      if (info.content) {
        embed.setTitle(info.title).setDescription(info.content)
        await msg.channel.send({ embed })
        console.log(`Discord ${msg.channel.id}\n${msg.content}\n`.green, info.title, info.content)
      }
    } catch (error) {
      console.warn(`Discord ${msg.channel.id}\n${msg.content}\n`.red, error)
    }
  })

  const length = messages.activity.length

  setInterval(() => {
    messages.activity[length] = '서버 ' + discord.guilds.size + '개에서 사용'
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
      console.log(`Slack ${event.channel}\n`.green, info)
    } catch (error) {
      console.warn(`Slack ${event.channel}\n`.red, error)
    }
  })

  slack.on('message', async event => {
    try {
      const info = await school(event.text, event.channel, 'slack')

      if (info.content) {
        await slack.sendMessage(info.title + info.content, event.channel)
        console.log(`Slack ${event.channel}\n${event.text}\n`.green, info.title, info.content)
      }
    } catch (error) {
      console.warn(`Slack ${event.channel}\n${event.text}\n`.red, error)
    }
  });

  (async () => {
    await slack.start()
    console.log('Slackbot is running!'.green)
  })()
}
