const school = require("school.hana.js")
import { MessageActionRow, MessageSelectMenu } from "discord.js"
import { SlashCommandBuilder } from "@discordjs/builders"

import School from "@/models/school"

export const data = new SlashCommandBuilder()
  .setName("school")
  .setDescription("학교 검색하기")
  .addStringOption((option) =>
    option.setName("name").setDescription("학교 이름").setRequired(true)
  )

export const init = async (client) => {
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isSelectMenu()) return

    if (interaction.customId === "school") {
      await interaction.deferUpdate()

      await School.findOneAndUpdate(
        { id: interaction.user.id },
        { school: interaction.values[0] },
        { upsert: true }
      )

      await interaction.editReply({
        content: "기억했어! 이제 다른 명령어를 사용해봐",
        components: [],
      })
    }
  })
}

export const execute = async (interaction) => {
  try {
    await interaction.deferReply()

    const res = await school.search({
      SCHUL_NM: interaction.options.getString("name"),
    })

    const options = []

    res.forEach((e) => {
      options.push({
        label: e.SCHUL_NM,
        description: e.ORG_RDNMA,
        value: e.ATPT_OFCDC_SC_CODE + e.SD_SCHUL_CODE,
      })
    })

    const row = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId("school")
        .setPlaceholder("Nothing selected")
        .addOptions(options)
    )

    await interaction.editReply({
      content: "학교를 선택해줘!",
      components: [row],
    })
  } catch {
    await interaction.editReply({
      content: "알려준 학교를 찾지 못했어...",
    })
  }
}
