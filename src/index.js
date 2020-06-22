const { RTMClient } = require('@slack/rtm-api')
const Discord = require('discord.js')
const colors = require('colors')
const fs = require('fs')

const school = require('./school')
const messages = JSON.parse(fs.readFileSync('src/messages.json').toString())

if (process.env.discordToken) {
  const discord = new Discord.Client()
  const length = messages.activity.length

  discord.on('ready', () => {
    console.log(`Logged in as ${discord.user.tag}!`.green)
    setInterval(() => {
      messages.activity[length] = '서버 ' + discord.guilds.size + '개에서 사용'
      discord.user.setActivity(messages.activity[Math.floor(Math.random() * messages.activity.length)], {
        type: process.env.twitch ? 'STREAMING' : null,
        url: 'https://www.twitch.tv/' + process.env.twitch
      })
    }, 10000)
  })

  discord.on('message', async msg => {
    try {
      const info = await school(msg.content, msg.channel.id, 'discord', { type: '' })
      if (info) {
        await msg.channel.send({ embed: info })
        console.log(`Discord ${msg.channel.id}\n${msg.content}\n`.green, info)
      }
    } catch (error) {
      console.warn(`Discord ${msg.channel.id}\n${msg.content}\n`.red, error)
    }
  })

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

      if (info) {
        await slack.sendMessage(info, event.channel)
        console.log(`Slack ${event.channel}\n${event.text}\n`.green, info)
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
