const school = require("school.hana.js")
import { MessageActionRow, MessageEmbed, MessageSelectMenu } from "discord.js"
import { SlashCommandBuilder } from "@discordjs/builders"

import School from "@/models/school"

const week = ["일", "월", "화", "수", "목", "금", "토"]

const find = async (interaction) => {
  const data = await School.findOne({ id: interaction.user.id })

  if (!data) {
    return await interaction.editReply({
      content: "/school 명령어로 학교를 먼저 알려줘!",
    })
  }

  const values = interaction.values
  const date = values ? new Date(values[0]) : new Date()
  const W = week[date.getDay()]
  const Y = String(date.getFullYear())
  const M = String(date.getMonth() + 1)
  const D = String(date.getDate())

  const meal = await school.meal({
    ATPT_OFCDC_SC_CODE: data.school.substr(0, 3),
    SD_SCHUL_CODE: data.school.substr(3),
    MLSV_YMD: Y + M.padStart(2, "0") + D.padStart(2, "0"),
  })

  const fields = []
  const options = []

  meal.forEach((e) => {
    fields.push({
      name: e.MMEAL_SC_NM,
      value: e.DDISH_NM.replace(/<br\/>/gi, "\n"),
      inline: true,
    })
  })

  date.setDate(date.getDate() - 3)

  for (let index = 0; index < 7; index++) {
    const W = week[date.getDay()]
    const Y = String(date.getFullYear())
    const M = String(date.getMonth() + 1)
    const D = String(date.getDate())

    options.push({
      label: `${Y}년 ${M}월 ${D}일 (${W})`,
      value: `${Y}-${M.padStart(2, "0")}-${D.padStart(2, "0")}`,
      default: index === 3,
    })

    date.setDate(date.getDate() + 1)
  }

  const embed = new MessageEmbed()
    .setColor("#7f00ff")
    .setTitle(meal[0].SCHUL_NM)
    .setDescription(`${Y}년 ${M}월 ${D}일 ${W}요일`)
    .addFields(...fields)

  const row = new MessageActionRow().addComponents(
    new MessageSelectMenu()
      .setCustomId("meal")
      .setPlaceholder("Nothing selected")
      .addOptions(options)
  )

  await interaction.editReply({
    embeds: [embed],
    components: [row],
  })
}

export const data = new SlashCommandBuilder()
  .setName("meal")
  .setDescription("급식 확인하기")

export const init = async (client) => {
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isSelectMenu()) return

    if (interaction.customId === "meal") {
      await interaction.deferUpdate()

      find(interaction)
    }
  })
}

export const execute = async (interaction) => {
  try {
    await interaction.deferReply()

    await find(interaction)
  } catch (err) {
    console.error(err)

    await interaction.editReply({
      content: "급식을 확인하지 못했어...",
    })
  }
}
