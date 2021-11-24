import { env } from "process"
import { REST } from "@discordjs/rest"
import { Routes } from "discord-api-types/v9"

import { CommandOptions } from "@/types"

export abstract class Command {
  public conf: CommandOptions

  constructor(protected options: CommandOptions) {
    this.conf = {
      name: options.name,
      description: options.description || "No information specified.",
    }
  }

  public abstract discord(interaction: any): Promise<void>
}

export const init = async () => {
  const commands = [
    {
      name: "ping",
      description: "pong",
    },
  ]

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
