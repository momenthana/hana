import { Command } from "@/Command"

export class Ping extends Command {
  constructor() {
    super({
      name: "ping",
      description: "Replies with Pong!",
    })
  }

  public async discord(interaction): Promise<void> {
    await interaction.reply("Pong!")
  }
}
