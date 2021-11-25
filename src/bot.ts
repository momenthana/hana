import fs from "fs"
import mongoose from "mongoose"
import { env } from "process"
import {
  Client,
  Collection,
  Intents,
  MessageMentions,
  MessageActionRow,
  MessageButton,
} from "discord.js"

mongoose.connect(
  `mongodb+srv://${env.MONGO_DB_USER}:${env.MONGO_DB_PASS}@${env.MONGO_DB_HOST}/bot`
)

if (env.DISCORD_TOKEN) {
  const client = new Client({
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.DIRECT_MESSAGES,
    ],
  })

  const commands = new Collection()
  const commandFiles = fs
    .readdirSync(__dirname + "/commands")
    .filter((file) => file.endsWith(".ts"))

  for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    command.init(client)
    commands.set(command.data.name, command)
  }

  client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`)

    client.user.setActivity("/school")
  })

  client.on("messageCreate", async (message: any) => {
    if (message.author.bot) return

    if (
      message.content.match(MessageMentions.USERS_PATTERN) &&
      message.content
        .match(MessageMentions.USERS_PATTERN)
        .includes(`<@!${client.user.id}>`)
    ) {
      message.reply({
        content:
          "하나는 이제 명령어 기반으로 동작해!\n/meal 로 급식을 확인해줘\n더 개발해서 돌아올게...\n명령어 확인이 안되면 아래 버튼으로 서버에 다시 초대해줘",
        components: [
          new MessageActionRow().addComponents(
            new MessageButton()
              .setURL(
                "https://discord.com/api/oauth2/authorize?client_id=711769311387058238&permissions=8&scope=bot"
              )
              .setStyle("LINK")
              .setLabel("다시 초대하기")
          ),
        ],
      })
    }
  })

  client.on("interactionCreate", async (interaction: any) => {
    if (!interaction.isCommand()) return

    const command = commands.get(interaction.commandName)

    if (!command) return

    try {
      // @ts-expect-error
      await command.execute(interaction)
    } catch (err) {
      console.error(err)

      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      })
    }
  })

  client.login(env.DISCORD_TOKEN)
}
