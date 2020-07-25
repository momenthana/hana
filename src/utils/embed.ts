import discord from 'discord.js'

const embed = msg => {
	return new discord.MessageEmbed()
		.setFooter(msg.member.displayName, msg.author.avatarURL())
		.setTimestamp(new Date())
		.setColor(msg.guild.me.displayColor || process.env.color)
}

export default embed
