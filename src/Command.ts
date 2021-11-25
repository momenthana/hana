import fs from "fs"
import { env } from "process"
import { REST } from "@discordjs/rest"
import { Routes } from "discord-api-types/v9"

const commands = []
const commandFiles = fs
  .readdirSync(__dirname + "/commands")
  .filter((file) => file.endsWith(".ts"))

export const init = async () => {
  for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    commands.push(command.data.toJSON())
  }

  const rest = new REST({ version: "9" }).setToken(env.DISCORD_TOKEN)

  try {
    console.log("Started refreshing application (/) commands.")

    await rest.put(
      env.NODE_ENV === "production"
        ? // @ts-expect-error
          Routes.applicationCommands(env.CLIENT_ID)
        : // @ts-expect-error
          Routes.applicationGuildCommands(env.CLIENT_ID, env.GUILD_ID),
      {
        body: commands,
      }
    )

    console.log("Successfully reloaded application (/) commands.")
  } catch (err) {
    console.error(err)
  }
}
