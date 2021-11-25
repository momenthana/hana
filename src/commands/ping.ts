import { SlashCommandBuilder } from "@discordjs/builders"

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Replies with Pong!")

export const init = async () => {}

export const execute = async (interaction) => {
  return interaction.reply("Pong!")
}
