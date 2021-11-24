import { Client, Intents } from "discord.js"

import { Ping } from "@/commands"
import { init } from "@/Command"

const commands = {
  ping: new Ping(),
}

if (process.env.DISCORD_TOKEN) {
  init()

  const discord = new Client({ intents: [Intents.FLAGS.GUILDS] })

  discord.on("ready", () => {
    console.log(`Logged in as ${discord.user.tag}!`)
  })

  discord.on("interactionCreate", async (interaction: any) => {
    if (!interaction.isCommand()) return

    if (commands[interaction.commandName]) {
      await commands[interaction.commandName].discord(interaction)
    }
  })

  discord.login(process.env.DISCORD_TOKEN)
}
