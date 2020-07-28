import Discord from 'discord.js'
import colors from 'colors'
import fs from 'fs'
import school from './school'
import { embed } from './utils'
import Koa from 'koa'
import Router from 'koa-router'
import bodyParser from 'koa-bodyparser'
import axios from 'axios'

const messages = JSON.parse(fs.readFileSync('src/messages.json').toString())

if (process.env.discordToken) {
  const discord = new Discord.Client()

  discord.on('ready', () => {
    console.log(colors.green(`Logged in as ${discord.user.tag}!`))
  })

  discord.on('message', async msg => {
    try {
      if (msg.author.bot) return

      if (msg.content.match(/하나.*(핑|ping)|(핑|ping).*하나/)) {
        const Embed = embed(msg)
        Embed.setTitle(msg.content.includes('핑') ? '퐁!' : 'Pong!')
          .addField('Discord Server', '측정중...')
          .addField('지연 시간', '측정중...')
        let ping = await msg.channel.send(Embed)
        Embed.fields = []
        Embed.addField('Discord Server', Math.round(discord.ws.ping) + 'ms')
          .addField('지연 시간', ping.createdTimestamp - msg.createdTimestamp + 'ms')
        ping.edit(Embed)
      } else {
        const Embed = embed(msg)
        const result = await school('discord', msg.channel.id, msg.content, Embed)
        if (result.description || result.fields.length) {
          await msg.channel.send(result)
        }
      }
    } catch (error) {
      console.warn(error)
    }
  })

  const length = messages.activity.length
  setInterval(async () => {
    messages.activity[length] = '서버 ' + discord.guilds.cache.size + '개에서 사용'
    await discord.user.setActivity(messages.activity[Math.floor(Math.random() * messages.activity.length)], {
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

        const Embed = new Discord.MessageEmbed()
        const result = await school('messenger', webhook_event.recipient.id, webhook_event.message.text, Embed)
        if (result.description || result.fields.length) {
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
