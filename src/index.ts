import Discord from 'discord.js'
import colors from 'colors'
import fs from 'fs'
import Koa from 'koa'
import Router from 'koa-router'
import bodyParser from 'koa-bodyparser'
import axios from 'axios'
import school from './school'
import { embed } from './utils'

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

      const result = await school('discord', msg.channel.id, msg.content.replace(/<@!?(\d+)>/g, ''), embed(msg), discord, msg)
      if (result && (result.description || result.fields.length)) await msg.channel.send(result)
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

if (process.env.messengerToken) {
  const koa = new Koa()
  const router = new Router()

  router.get('/messenger', ctx => {
    let mode = ctx.request.query['hub.mode']
    let token = ctx.request.query['hub.verify_token']
    let challenge = ctx.request.query['hub.challenge']

    if (mode && token) {
      if (mode === 'subscribe' && token === process.env.messengerToken) {
        console.log('WEBHOOK_VERIFIED')
        ctx.body = challenge
      } else {
        ctx.response.status = 403
      }
    }
  })

  router.post('/messenger', ctx => {
    let body = ctx.request.body

    if (body.object === 'page') {
      body.entry.forEach(async entry => {
        let webhook_event = entry.messaging[0]

        const result = await school('messenger', webhook_event.sender.id, webhook_event.message.text, new Discord.MessageEmbed(), null, null)
        if (result && (result.description || result.fields.length)) {
          let fields = ''
          if (result.fields.length) {
            result.fields.forEach(element => {
              fields += element.name + element.value + '\n'
            })
          }
          axios.post('https://graph.facebook.com/v7.0/me/messages?access_token=' + process.env.messengerToken, {
            messaging_type: "RESPONSE",
            recipient: {
              id: webhook_event.sender.id
            },
            message: {
              text: (result.title ? result.title + '\n' : '') + (result.description ? result.description + '\n' : '') + fields
            }
          })
        }
      })

      ctx.body = 'EVENT_RECEIVED'
    } else {
      ctx.response.status = 404
    }
  })

  koa.use(bodyParser()).use(router.routes()).use(router.allowedMethods())

  koa.listen(3000)
}
