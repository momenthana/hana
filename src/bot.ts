import fs from "fs"
import mongoose from "mongoose"
import { env } from "process"
import { Client, Collection, Intents } from "discord.js"

mongoose.connect(
  `mongodb+srv://${env.MONGO_DB_USER}:${env.MONGO_DB_PASS}@${env.MONGO_DB_HOST}/bot`
)

if (env.DISCORD_TOKEN) {
  const client = new Client({ intents: [Intents.FLAGS.GUILDS] })

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
