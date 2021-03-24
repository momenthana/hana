import { Client } from "discord.js"
import "colors"
import fs from "fs"
import {
  Help,
  Invite,
  Meal,
  Ping,
  Remove,
  Schedule,
  Search,
  Uptime,
} from "./commands"
import { embed } from "./utils"

const commands = {
  "help|도움|도와줘|명령": Help,
  "invite|초대링크|초대주소|초대|추가": Invite,
  "meal|아침|조식|점심|중식|저녁|석식|급식|식단|학식": Meal,
  "ping|핑": Ping,
  "remove|삭제|제거": Remove,
  "schedule|일정": Schedule,
  "search|검색|등록": Search,
  "uptime|업타임": Uptime,
}

const messages = JSON.parse(fs.readFileSync("src/messages.json").toString())

if (process.env.discordToken) {
  const discord = new Client()

  discord.on("ready", () => {
    console.log(`Logged in as ${discord.user.tag}!`.green)
  })

  discord.on("message", async (msg) => {
    try {
      if (msg.author.bot) return

      if (msg.system) {
        if (msg.type == "GUILD_MEMBER_JOIN") msg.react("👋")
        else if (msg.type == "PINS_ADD") msg.react("📌")
        return
      }

      if (process.env.test)
        console.log(
          msg.channel.id.green,
          msg.author.username.yellow,
          msg.content
        )

      if (
        !msg.content.includes(discord.user.username) !=
        (msg.mentions.users.first()
          ? discord.user.id == msg.mentions.users.first().id
          : false)
      )
        return

      for (const [regexp, command] of Object.entries(commands)) {
        if (msg.content.match(RegExp(regexp, "i"))) {
          new command({ msg, discord, embed: embed(msg) }).discord()
        }
      }
    } catch (error) {
      console.warn(error)
    }
  })

  setInterval(() => {
    discord.user.setActivity(
      eval(
        messages.activity[Math.floor(Math.random() * messages.activity.length)]
      ),
      {
        type: process.env.twitch ? "STREAMING" : null,
        url: "https://www.twitch.tv/" + process.env.twitch,
      }
    )
  }, 10000)

  discord.login(process.env.discordToken)
}
